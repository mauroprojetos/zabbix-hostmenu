/*
 ** Zabbix
 ** Copyright (C) 2001-2016 Zabbix SIA
 **
 ** This program is free software; you can redistribute it and/or modify
 ** it under the terms of the GNU General Public License as published by
 ** the Free Software Foundation; either version 2 of the License, or
 ** (at your option) any later version.
 **
 ** This program is distributed in the hope that it will be useful,
 ** but WITHOUT ANY WARRANTY; without even the implied warranty of
 ** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 ** GNU General Public License for more details.
 **
 ** You should have received a copy of the GNU General Public License
 ** along with this program; if not, write to the Free Software
 ** Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 **/


jQuery(function($) {

	if ($('#search').length) {
		createSuggest('search');
	}

	if (IE) {
		setTimeout(function () { $('[autofocus]').focus(); }, 10);
	}

	/**
	 * Change combobox color according selected option.
	 */
	$('select').each(function() {
		var comboBox = $(this),
			changeClass = function(obj) {
				if (obj.find('option.red:selected').length > 0) {
					obj.addClass('red');
				}
				else {
					obj.removeClass('red');
				}
			};

		comboBox.change(function() {
			changeClass($(this));
		});

		changeClass(comboBox);
	});

	/**
	 * Build menu popup for given elements.
	 */
	$(document).on('click', '[data-menu-popup]', function(event) {
		var obj = $(this),
			data = obj.data('menu-popup');

		switch (data.type) {
			case 'favouriteGraphs':
				data = getMenuPopupFavouriteGraphs(data);
				break;

			case 'favouriteMaps':
				data = getMenuPopupFavouriteMaps(data);
				break;

			case 'favouriteScreens':
				data = getMenuPopupFavouriteScreens(data);
				break;

			case 'history':
				data = getMenuPopupHistory(data);
				break;

			case 'host':
                //zabbix-hostmenu patch START
                var rpcRequest = {
                    'method': 'host.get',
                    'params': {
                        'filter': {'hostid': data.hostid},
                        'output': ['hostid','host','name'],
                        'selectInventory': 'extend',
                        "selectInterfaces": ["ip","main"]
                    },
                    'onSuccess': function (response) {
                        
                        data.inventory = response[0].inventory;
                        data.hostname = response[0].hostname;
                        data.host = response[0].host;
                        data.ip = response[0].interfaces[0].ip;

                        data = getMenuPopupHost(data);

                        obj.menuPopup(data, event);
                    }
                };
                                
                var api = Object.create(RPC);
                api = RPC;
                api.rpcurl("api_jsonrpc.php");
                
                new api.Call(rpcRequest);
                RPC.rpcurl("jsrpc.php?output=json-rpc");//RACE CONDITION?

                
                
                return false;
                //zabbix-hostmenu patch END
				break;

			case 'map':
				data = getMenuPopupMap(data);
				break;

			case 'refresh':
				data = getMenuPopupRefresh(data);
				break;

			case 'trigger':
				//zabbix-hostmenu patch START PART #2 (graphs in triggers menu auto add)
                var itemids = data.items.map(function(item) {
                        return item.params.itemid;
                    });                

                var rpcRequest = {
                    'method': 'graph.get',
                    'params': {
                        'output': ['graphid','name'],
                        'itemids': itemids,
                    },
                    'onSuccess': function (response) {

                        data.graphs = response;
                        data = getMenuPopupTrigger(data);
                        obj.menuPopup(data, event);
                    }
                };
                                
                var api = Object.create(RPC);
                api = RPC;
                api.rpcurl("api_jsonrpc.php");
                
                new api.Call(rpcRequest);
                RPC.rpcurl("jsrpc.php?output=json-rpc");//RACE CONDITION?

                return false;
                //zabbix-hostmenu patch END PART #2
				break;

			case 'triggerLog':
				data = getMenuPopupTriggerLog(data);
				break;

			case 'triggerMacro':
				data = getMenuPopupTriggerMacro(data);
				break;
		}

		obj.menuPopup(data, event);

		return false;
	});

	/*
	 * add.popup event
	 *
	 * Call multiselect method 'addData' if parent was multiselect, execute addPopupValues function
	 * or just update input field value
	 *
	 * @param object data
	 * @param string data.object   object name
	 * @param array  data.values   values
	 * @param string data.parentId parent id
	 */
	$(document).on('add.popup', function(e, data) {
		// multiselect check
		if ($('#' + data.parentId).hasClass('multiselect')) {
			for (var i = 0; i < data.values.length; i++) {
				if (typeof data.values[i].id !== 'undefined') {
					var item = {
						'id': data.values[i].id,
						'name': data.values[i].name
					};

					if (typeof(data.values[i].prefix) !== 'undefined') {
						item.prefix = data.values[i].prefix;
					}

					jQuery('#' + data.parentId).multiSelect('addData', item);
				}
			}
		}
		else if (typeof addPopupValues !== 'undefined') {
			// execute function if they exist
			addPopupValues(data);
		}
		else {
			jQuery('#' + data.parentId).val(data.values[0].name);
		}
	});

	// redirect buttons
	$('button[data-url]').click(function() {
		var button = $(this);
		var confirmation = button.data('confirmation');

		if (typeof confirmation === 'undefined' || (typeof confirmation !== 'undefined' && confirm(confirmation))) {
			window.location = button.data('url');
		}
	})
});
