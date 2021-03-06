# Dom Outline

Firebug/Dev Tools-like DOM outline implementation using jQuery.

This fork additionally support the following options: `border`, `realtime`, `label`, `multiple`

### Example Usage

```js
var myExampleClickHandler = function (element) { console.log('Clicked element:', element); }
var myDomOutline = DomOutline({ onClick: myExampleClickHandler, filter: 'div' });

// Start outline:
myDomOutline.start();

// Stop outline (also stopped on escape/backspace/delete keys):
myDomOutline.stop();
```

### Options

<table>
	<tr>
		<th>Option</th>
		<th>Description</th>
		<th>Default</th>
	</tr>
	<tr>
		<td><b>borderWidth</b></td>
		<td>The width of the outline border, in pixels.</td>
		<td>2</td>
	</tr>
	<tr>
		<td><b>onClick</b></td>
		<td>The function fired when the user clicks while the DOM outline is active. Receives the target element as an argument.</td>
		<td>false</td>
	</tr>
	<tr>
		<td><b>namespace</b></td>
		<td>The private namespace used for CSS selectors and events. Available in the unlikely event of possible event/CSS collisions.</td>
		<td>'DomOutline'</td>
	</tr>
	<tr>
		<td><b>filter</b></td>
		<td>A selector that an element should match in order to be outlined and clicked. By default no filter is applied.</td>
		<td>false</td>
	</tr>
	<tr>
		<td><b>border</b></td>
		<td>A border used as the visual indicator surrounding the element. If false a semi-transparent blue overlay box is used instead (like firebug).</td>
		<td>false</td>
	</tr>
	<tr>
		<td><b>realtime</b></td>
		<td>Shows the visual indicator as you hover the mouse over the elements. If false the visual indicator shows when clicking an element (maybe implementing ctrl-left click is better?).</td>
		<td>false</td>
	</tr>
	<tr>
		<td><b>label</b></td>
		<td>Shows a label above the visual indicator. The label contains the element's name, id, class name, and dimensions.</td>
		<td>false</td>
	</tr>
	<tr>
		<td><b>multiple</b></td>
		<td>Select multiple elments. Click to select, click again to cancel.</td>
		<td>false</td>
	</tr>
</table>

### Other Notes

* Tested to work in Chrome, FF, Safari. Buggy in IE ;(
* Creates a single global variable: `window.DomOutline`
