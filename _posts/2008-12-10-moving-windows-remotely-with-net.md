---
title: Moving Windows remotely with .NET
date: 2008-12-10T19:34:16+00:00
layout: post
tags:
  - csharp
---
A colleague of mine has a dual-monitor windows system.

Unfortunately he has a different monitor setup for home and work (work – 2nd monitor on the left; home – 2nd monitor on the right). Now when you work with certain Java applications which save their position on their own you come to the point where an window pops up out of the viewing range.

Now you have nearly now way to move that window, because you can’t click it. Moving over the task bar doesn’t work either. So I wrote a simple Application which can move the lost window back into the viewing range.

Here a bit out of the c# code:

{% highlight csharp %}
[ DllImport("user32.dll") ]
static extern IntPtr GetForegroundWindow();

[DllImportAttribute("user32.dll")]
[return: MarshalAs(UnmanagedType.Bool)]
static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

[DllImport("user32.dll", ExactSpelling = true, CharSet = System.Runtime.InteropServices.CharSet.Auto)]
private static extern bool MoveWindow(IntPtr hWnd, int x, int y, int cx, int cy, bool repaint);

...
private void timer1_Tick(object sender, System.EventArgs e)
{
	IntPtr temp  = GetForegroundWindow();
	if( me != temp)
	{
		window = temp;
		label1.Text = window.ToString();
			RECT t = new RECT();
		bool r = GetWindowRect(window, out t);

		posx = t.Location.X;
		posy = t.Location.Y;
		sizex = t.Width;
		sizey = t.Height;
		label1.Text = label1.Text + "\nx: "  + t.Location.X+ "\ny: " + t.Location.Y
				+"\nwidth: "+sizex + "\nheight: " + sizey;
		}
	}

private void button2_Click(object sender, System.EventArgs e)
{
	//right
	posx = posx +10;
	MoveWindow((IntPtr)window, posx, posy , sizex, sizey, true);
}
{% endhighlight %}

This is just to get a basic idea what I’ve done here. You can also look at the complete source code yourself (vs2003 project is attached) or just use the application as is (although it is pretty ugly – more like a proof of concept.

downloads:

  * [windowsapplication1.exe](/assets/windowsapplication1.exe)
  * [windowsapplication1 project folder](/assets/windowsapplication1.zip)

[follow-up here](/2009/02/01/moving-windows-part2.html "follow-up here")
