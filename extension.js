/*	Snap Manager
	Unofficial snap manager for usual snap tasks
	GNOME Shell extension
	(c) Francois Thirioux 2020
	License: GPLv3 */
	

const { Clutter, Gio, GObject, Shell, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const Util = imports.misc.util;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

// here you can add/remove/hack the actions
var menuActions =	[	
						["List installed snaps", "echo List installed snaps; echo; snap list"],
						["Recent snap changes", "echo Recent snap changes; echo; snap changes"],
						["List snap updates", "echo List snap updates; echo; snap refresh --list"],
						["Refresh installed snaps", "echo Refresh installed snaps; echo; snap refresh"],
						["Install snap...", "echo Install snap...; echo; read -p 'Enter snap name: ' snapname; read -p 'Enter channel (void=default): ' snapchannel; echo; snap install $snapname --channel=$snapchannel"],
						["Remove snap...", "echo Remove snap...; echo; snap list; echo; read -p 'Enter snap name: ' snapname; echo; snap remove $snapname"]
					];

// here you can add/remove/hack the extra actions					
var menuExtraActions = 	[
							["Change snap channel...", "echo Change snap channel...; echo; snap list; echo; read -p 'Enter snap name: ' snapname; read -p 'Enter channel: ' snapchannel; echo; snap refresh $snapname --channel=$snapchannel"],
							["Snap info...", "echo Snap info...; echo; read -p 'Enter snap name: ' snapname; echo; snap info $snapname"],
							["Find snap...", "echo Find snap...; echo; read -p 'Enter one word to search: ' snapsearch; echo; snap find $snapsearch"]
						];
						
// here you can add/remove/hack the hold refresh time options
var menuRefreshOptions =	[
							["Refresh schedule", "echo Refresh schedule; echo; snap refresh --time"],
							["Hold auto refresh for one hour", "echo Hold auto refresh for one hour; echo; echo; sudo snap set system refresh.hold=$(date --iso-8601=seconds -d '1 hour'); echo; echo Refresh schedule; echo; snap refresh --time | grep hold"],
							["Hold auto refresh for one day", "echo Hold auto refresh for one day; echo; sudo snap set system refresh.hold=$(date --iso-8601=seconds -d '1 day'); echo; echo Refresh schedule; echo; snap refresh --time | grep hold"],
							["Hold auto refresh for one week", "echo Hold auto refresh for one week; echo; sudo snap set system refresh.hold=$(date --iso-8601=seconds -d '1 week'); echo; echo Refresh schedule; echo; snap refresh --time | grep hold"],
							["Cancel refresh delay", "echo Cancel hold auto refresh delay; echo; sudo snap set system refresh.hold=$(date --iso-8601=seconds -d '0 second'); echo; echo Refresh schedule; echo; snap refresh --time"]
						]

let SnapMenu = GObject.registerClass(
class SnapMenu extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Snap manager');

        let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        let icon = new St.Icon({
        	// here you can change the menu icon (waiting for snap symbolic icon...)
            icon_name: 'applications-system-symbolic',
            style_class: 'system-status-icon',
        });
        // here you can remove the menu label (step 1/2)
        let label = new St.Label({
        	text: "Snaps",
        	y_align: Clutter.ActorAlign.CENTER,
        });

        hbox.add_child(icon);
        // here you can remove the menu label (step 2/2)
        hbox.add_child(label);
        hbox.add_child(PopupMenu.arrowIcon(St.Side.BOTTOM));
        this.add_child(hbox);
		
		// main menu
		menuActions.forEach(this._addSnapMenuItem.bind(this));
		
		// extra actions submenu
		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
		this.submenu1 = new PopupMenu.PopupSubMenuMenuItem('Extra actions');
		this.menu.addMenuItem(this.submenu1);
		menuExtraActions.forEach(this._addExtraSubmenuItem.bind(this));
		// refresh options submenu
		this.submenu2 = new PopupMenu.PopupSubMenuMenuItem('Refresh options');
		this.menu.addMenuItem(this.submenu2);
		menuRefreshOptions.forEach(this._addRefreshSubmenuItem.bind(this));
		
		// open Snap Store in default browser
		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
		this.menu.addAction("Open Snap Store website", event => {
			Util.trySpawnCommandLine("xdg-open https://snapcraft.io/store");
		})
    }
    
    // main menu items
    _addSnapMenuItem(item, index, array) {
    	if (index == 3) {
	    		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
	    }
	    this.menu.addAction(item[0],event => {
	    	try {
    			Util.trySpawnCommandLine("gnome-terminal -x bash -c \"" + item[1] + "; echo; echo --; read -n 1 -s -r -p 'Press any key to close...'\"");
			} catch(err) {
    			Main.notify("Error: unable to execute command in GNOME Terminal");
			}
	    });
	}
	
	// extra actions submenu items
	_addExtraSubmenuItem(item, index, array) {
	    this.submenu1.menu.addAction(item[0],event => {
	    	try {
    			Util.trySpawnCommandLine("gnome-terminal -x bash -c \"" + item[1] + "; echo; echo --; read -n 1 -s -r -p 'Press any key to close...'\"");
			} catch(err) {
    			Main.notify("Error: unable to execute command in GNOME Terminal");
			}
	    });
	}
	
	// refresh options submenu items
	_addRefreshSubmenuItem(item, index, array) {
	    this.submenu2.menu.addAction(item[0],event => {
	    	try {
    			Util.trySpawnCommandLine("gnome-terminal -x bash -c \"" + item[1] + "; echo; echo --; read -n 1 -s -r -p 'Press any key to close...'\"");
			} catch(err) {
    			Main.notify("Error: unable to execute command in GNOME Terminal");
			}
	    });
	}
});

function init() {
}

let _indicator;

function enable() {
    _indicator = new SnapMenu();
    Main.panel.addToStatusArea('snap-menu', _indicator);
}

function disable() {
    _indicator.destroy();
}
