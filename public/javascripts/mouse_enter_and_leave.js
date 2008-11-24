//mouseenter, mouseleave
//from http://dev.rubyonrails.org/attachment/ticket/8354/event_mouseenter_106rc1.patch
Object.extend(Event, (function() {
	var cache = Event.cache;

	function getEventID(element) {
		if (element._prototypeEventID) return element._prototypeEventID[0];
		arguments.callee.id = arguments.callee.id || 1;
		return element._prototypeEventID = [++arguments.callee.id];
	}

	function getDOMEventName(eventName) {
		if (eventName && eventName.include(':')) return "dataavailable";
		//begin extension
		eventName = {
			mouseenter: 'mouseover',
			mouseleave: 'mouseout'
		}[eventName] || eventName;
		//end extension
		return eventName;
	}

	function getCacheForID(id) {
		return cache[id] = cache[id] || { };
	}

	function getWrappersForEventName(id, eventName) {
		var c = getCacheForID(id);
		return c[eventName] = c[eventName] || [];
	}

	function createWrapper(element, eventName, handler) {
		var id = getEventID(element);
		var c = getWrappersForEventName(id, eventName);
		if (c.pluck("handler").include(handler)) return false;

		var wrapper = function(event) {
			if (!Event || !Event.extend ||
				(event.eventName && event.eventName != eventName))
					return false;

			Event.extend(event);
			handler.call(element, event);
		};
		
		//begin extension
		if(['mouseenter','mouseleave'].include(eventName)){
			wrapper = wrapper.wrap(function(proceed,event) {	
				var rel = event.relatedTarget;
				var cur = event.currentTarget;			 
				if(rel && rel.nodeType == Node.TEXT_NODE)
					rel = rel.parentNode;	  
				if(rel && rel != cur && !rel.descendantOf(cur))	  
					return proceed(event);   
			});	 
		}
		//end extension

		wrapper.handler = handler;
		c.push(wrapper);
		return wrapper;
	}

	function findWrapper(id, eventName, handler) {
		var c = getWrappersForEventName(id, eventName);
		return c.find(function(wrapper) { return wrapper.handler == handler });
	}

	function destroyWrapper(id, eventName, handler) {
		var c = getCacheForID(id);
		if (!c[eventName]) return false;
		c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
	}

	function destroyCache() {
		for (var id in cache)
			for (var eventName in cache[id])
				cache[id][eventName] = null;
	}

	if (window.attachEvent) {
		window.attachEvent("onunload", destroyCache);
	}

	return {
		observe: function(element, eventName, handler) {
			element = $(element);
			var name = getDOMEventName(eventName);

			var wrapper = createWrapper(element, eventName, handler);
			if (!wrapper) return element;

			if (element.addEventListener) {
				element.addEventListener(name, wrapper, false);
			} else {
				element.attachEvent("on" + name, wrapper);
			}

			return element;
		},

		stopObserving: function(element, eventName, handler) {
			element = $(element);
			var id = getEventID(element), name = getDOMEventName(eventName);

			if (!handler && eventName) {
				getWrappersForEventName(id, eventName).each(function(wrapper) {
					element.stopObserving(eventName, wrapper.handler);
				});
				return element;

			} else if (!eventName) {
				Object.keys(getCacheForID(id)).each(function(eventName) {
					element.stopObserving(eventName);
				});
				return element;
			}

			var wrapper = findWrapper(id, eventName, handler);
			if (!wrapper) return element;

			if (element.removeEventListener) {
				element.removeEventListener(name, wrapper, false);
			} else {
				element.detachEvent("on" + name, wrapper);
			}

			destroyWrapper(id, eventName, handler);

			return element;
		},

		fire: function(element, eventName, memo) {
			element = $(element);
			if (element == document && document.createEvent && !element.dispatchEvent)
				element = document.documentElement;

			var event;
			if (document.createEvent) {
				event = document.createEvent("HTMLEvents");
				event.initEvent("dataavailable", true, true);
			} else {
				event = document.createEventObject();
				event.eventType = "ondataavailable";
			}

			event.eventName = eventName;
			event.memo = memo || { };

			if (document.createEvent) {
				element.dispatchEvent(event);
			} else {
				element.fireEvent(event.eventType, event);
			}

			return Event.extend(event);
		}
	};
})());

Object.extend(Event, Event.Methods);

Element.addMethods({
	fire:			Event.fire,
	observe:		Event.observe,
	stopObserving:	Event.stopObserving
});

Object.extend(document, {
	fire:			Element.Methods.fire.methodize(),
	observe:		Element.Methods.observe.methodize(),
	stopObserving:	Element.Methods.stopObserving.methodize()
});