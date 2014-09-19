var edge = require('edge');

var hello = edge.func(function () {/*
#r "PresentationCore.dll"
#r "PresentationFramework.dll"
#r "WindowsBase.dll"

#r "System.Xaml.dll"
#r "System.Threading.dll"
#r "System.Xml.dll"

using System.Windows;
using System.Threading;
using System.Windows.Controls;
using System.Threading.Tasks;
using System;
using System.Windows.Markup;
using System.IO;
using System.Windows.Input;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

public class Startup 
{
	public Task<object> Invoke(dynamic command)
	{
		var tcs = new TaskCompletionSource<object>();
		var ts = new ThreadStart(() => {
			var app = new Application();
			var window = new Window();
		
			UpgradeCommands(command.data);

			window.DataContext = command.data;

			using (var fileStream = File.OpenRead(command.xaml as string))
			{
				window.Content = XamlReader.Load(fileStream) as DependencyObject;
			}

			window.Show();
			
			window.Closing += (x,y) => {
				tcs.TrySetResult("");
			};

			var onStart = (Func<object,Task<object>>)command.onStart;
			Func<object,Task<object>> callback = async (dynamic x) => {
				if (x.action == "update"){
					(command.data as IDictionary<string,object>)[x.name as string] = x.value;
					window.DataContext = null;
					window.DataContext = command.data;
				}
				if (x.action == "rebind"){
					window.DataContext = null;
					window.DataContext = UpgradeCommands(command.data);
				}
				return null;
			};
			onStart(callback);

			app.Run();
		});

		var thread = new Thread(ts);
		thread.TrySetApartmentState(ApartmentState.STA);
		thread.Start();

		return tcs.Task;
	}

	private void UpgradeCommands(dynamic data)
	{
		var dictionary = data as IDictionary<string, object>;
		foreach (var key in dictionary.Keys.ToArray())
		{
			var func = dictionary[key] as Func<object,Task<object>>;
			if (null != func) 
			{
				dictionary[key] = new RelayCommand(func);
			}
		}		
	}
}

public class RelayCommand : ICommand
{
	private readonly Func<object,Task<object>> _execute;
	private readonly Func<object, bool> _canExecute;
	public RelayCommand(Func<object,Task<object>> execute) : this(execute, null) { }
	public RelayCommand(Func<object,Task<object>> execute, Func<object, bool> canExecute)
	{
		if (execute == null) throw new ArgumentNullException("execute");
		_execute = execute;
	}
	public bool CanExecute(object parameter)
	{
		return true;
	}
	public event EventHandler CanExecuteChanged
	{
		add { CommandManager.RequerySuggested += value; }
		remove { CommandManager.RequerySuggested -= value; }
	}
	public void Execute(object parameter)
	{
		_execute(parameter);
	}
}
*/});

var command = "";

var cb;
var input = {
	xaml: "CalculatorView.xaml",
	onStart : function(callback){
		cb = callback;
	},
	data: {
		Display: "READY",	
		NumberCommand : function(number){
			command += number;
			cb({action:"update", name:"Display", value:command});
		},
		AddCommand : function(){
			command += " + ";
			cb({action:"update", name:"Display", value:command});
		},
		SubtractCommand : function(){
			command += " - ";
			cb({action:"update", name:"Display", value:command});
		},
		MultiplyCommand : function(){
			command += " * ";
			cb({action:"update", name:"Display", value:command});
		},
		DivideCommand : function(){
			command += " / ";
			cb({action:"update", name:"Display", value:command});
		},
		ClearCommand : function(){
			command = "";
			cb({action:"update", name:"Display", value:command});
		},
		CalculateCommand : function(){
			command = eval(command)
			cb({action:"update", name:"Display", value:command});
		}
	}
};

hello(input, function (error, result) {
	if (error) throw error;
	console.log(result);
});

