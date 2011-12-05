
/**
 *    Istrap.js 0.1.0
 *    (c) 2011 ihaveu.com
 *    Freely distributed under the MIT license.
 *    For all details and documentation:
 *    https://github.com/ihaveu-gene/istrap
 */
var Istrap = (function(window, $, undefined){

	var root = this;
	var _slice = Array.prototype.slice;

  // 扩展 function 的 bind 方法
  Function.prototype.bind = Function.prototype.bind || function(object){
    if(arguments.length < 2 && object === undefined){ return this; }
    var self = this, args = _slice.call(arguments, 1);
    return function(){
      self.apply(object, args.concat(_slice.call(arguments, 0)));
    }
  };
  //_bind, 可以将执行环境的this，用参数方式带入
	Function.prototype._bind = function(object){
		if(arguments.length < 2 && object === undefined){ return this; }
		var self = this, args = _slice.call(arguments, 1);
		return function(){
			self.apply(object, args.concat(_slice.call(arguments, 0)).concat([this]));
		}
  };

  //原型克隆
  var clone = function(object){
    var F = function(){};
    F.prototype = object;
    return new F;
  };


  //类属性继承
  var _extend = function(object){
    var objects = _slice.call(arguments, 1);
    for(var i = 0; i < objects.length; i++){
      for(var j in objects[i]){
        if(objects[i][j] !== undefined) object[j] = objects[i][j];
      }
    }
    return object;
  };


  //原型属性 + 类属性继承
  var inherits = function(parent, protoProps, staticProps) {

    //从父类继承实例化方法
    var  child = function(){ return parent.apply(this, arguments); };

    //父类类属性继承
    _extend(child, parent);

    //父类原型属性继承
		/*
    var F = function(){};
    F.prototype = parent.prototype;
    child.prototype = new F();
		*/
		child.prototype = clone(parent.prototype);

    //添加新原型属性
    if (protoProps) _extend(child.prototype, protoProps);

    //添加新类属性
    if (staticProps) _extend(child, staticProps);

    //设置构造器为本身
    child.prototype.constructor = child;

    //添加__super__属性，可以调用父类的原型方法
    child.__super__ = {};
    _extend(child.__super__, parent);
    child.prototype.__super__ = parent.prototype;

    return child;
  };

  //继承封装
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  var support = {
    // 检查浏览器是否支持 pushState
    pushState: history.pushState ? true : false,

    // 检查浏览器是否支持 hashchange
		hashchange: 'onhashchange' in window
  }

  var I = {};

  I.VERSION = '0.0.1';

	//默认dom容器
	var container = 'body';

  //事件模块
  I.Events = {

    bind : function(ev, callback, context, one) {
      var calls = this._callbacks || (this._callbacks = {});
      var list  = calls[ev] || (calls[ev] = []);
      list.push(one === 1 ? [callback, context, 1] : [callback, context]);
      return this;
    },

    one : function(ev, callback, context){
      this.bind(ev, callback, context, 1);
      return this;
    },

    unbind : function(ev, callback) {
      var calls;
      if (!ev) {
        this._callbacks = {};
      } else if (calls = this._callbacks) {
        if (!callback) {
          calls[ev] = [];
        } else {
          var list = calls[ev];
          if (!list) return this;
          for (var i = 0, l = list.length; i < l; i++) {
            if (list[i] && callback === list[i][0]) {
              list[i] = null;
              break;
            }
          }
        }
      }
      return this;
    },

    trigger : function(eventName) {
      var list, calls, ev, callback, args;
      var both = 2;
      if (!(calls = this._callbacks)) return this;
      while (both--) {
        ev = both ? eventName : 'all';
        if (list = calls[ev]) {
          for (var i = 0, l = list.length; i < l; i++) {
            if (!(callback = list[i])) {
              list.splice(i, 1); i--; l--;
            } else {
              args = both ? _slice.call(arguments, 1) : arguments;
              callback[0].apply(callback[1] || this, args);
              if(callback[2] === 1) list[i] = null;
            }
          }
        }
      }
      return this;
    }
  
  };

  //model
  I.Model = function(attributes, options){
    var defaults;
    attributes || (attributes = {});
    if (defaults = this.defaults) {
      if ($.isFunction(defaults)) defaults = defaults.call(this);
      attributes = _extend({}, defaults, attributes);
    }
    this.attributes = {};
    
    this.set(attributes, {silent : true});
    this._changed = false;
    
    this.initialize(attributes, options);
  
  };

  //原型方法
  _extend(I.Model.prototype, I.Events, {

    initialize: function(){},

		/**
		* 获取一个属性值
		* @params
		* 	attr : 属性名
		*
		* @returns
		*	  返回属性值
		*/
    get : function(attr) {
      return this.attributes[attr];
    },

		/**
		* 设置属性值
		*
		* @params
		*   attrs : {key : val}
		*   options : {silent : true} 设置为true时 将不触犯change 事件
		*/
    set: function(attrs, options){
      options || (options = {});
      if (!attrs) return this;
      if (attrs.attributes) attrs = attrs.attributes;
      var now = this.attributes;

      for (var attr in attrs) {
        var val = attrs[attr];
        if (now[attr] != val) {
          now[attr] = val;
          this._changed = true;
          if (!options.silent) this.trigger('change:' + attr, this, val, options);
        }
      }

      if (!options.silent && this._changed)  this.trigger('change', this, options);
      
      this._changed = false;
      return this;    
    }

  });



  /*  controller 构造器
	*  @params
	*     options : { id : dom id  controller id, state : {hash: url hash, params : 参数}， silent: 为true时表示不需要切换显示效果}
  */
  I.Controller = function(options){
		options || (options = {});
    options.id && (this.id = options.id);
		options.state && (this.state = options.state);
		options.page && (this.page = options.page);
		if(!this.container) this.container = container; 

		if(this.className) this.page.className = this.className;
		this.silent = !!options.silent;

    this.bindEvents(this.events, true);
    this.initialize.apply(this, arguments);
		//this.fetch();
		if($(this.container).find(this.page).get(0)){
			this.bindEvents(this.customEvents);
		}
  };

  var eventSplitter = /^(\S+)\s*(.*)$/;

  //I.controller实例方法
  _extend(I.Controller.prototype, I.Events, {

		//page 默认class
		className : '',

		//是否需要每次重load
		//reLoad : false,


		//当前page环境
    $: function(selector){
      return $(selector, this.page);
    },
    
    //初始化方法
    initialize: function(){},

    /**
		* 模版渲染
		* @params
		* 	data : 数据
		* 	template : 模板
		* 	partial : 局部模板
		*
		* 若重写，需要手动调用 this.created();
		*/
    render: function(data, template, partial){
      data || (data = {});
      template || (template = this.constructor.template);    
      if(template){ 
      	$(this.page).html(Mustache.to_html(template, data, partial));
			}
			//重写render方法后，需要手动调用 created 方法
			this._create();
    },

		//页面渲染完成之后，调用
		_create : function(){
			$(this.container).append(this.page);
      //页面渲染后要绑定的事件
			this.bindEvents(this.customEvents);

      this.created = true;
			this.trigger('create');
			if(!this.silent){
        doComplete(this);
			}
		},

		//取数据，需要被重写
		fetch : function(){
			this.render();
		},

    //删除指定元素
    destroy: function(){
			$(this.page).remove();
			delete PAGES[this.id];
    },

		//批量绑定事件
    bindEvents : function(events, delegate) {
      if (!events) return;
      delegate = delegate === true ? true : false;

      for (var key in events) {
        var method = this[events[key]];
        if (!method) throw new Error('Event "' + events[key] + '" does not exist');
        var match = key.match(eventSplitter);
        var eventName = match[1], selector = match[2];
        method = method._bind(this);
				if(delegate){
					$(this.page).on(eventName, selector, method);
				}else{
					$(selector, this.page).on(eventName, method);
				}
      }
    }

  });


	//路由映射正则
  var namedParam    = /:([\w\d]+)/g;
  var splatParam    = /\*([\w\d]+)/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;
  var hashStrip     = /^#*/;

	//chang hash 时用的标记变量
	var changeHashSilent = false;
	//记录所有的controller实例
	var PAGES = {};

	//当前controller
	I.currentController = null;

	/*
	* 根据hash 生成md5 ID， 前缀 p
	* @params hash
	*
	* @return id
	*/
  I.generateId = function(hash){
    return 'p' + md5(hash);
  };

	// Rout 模块
	I.Router = { 

		init: function(options){
			options || (options = {});
			if (options.routes) this.routes = options.routes;
			this.pushState = support.pushState;
			if (options.pushState === false) this.pushState = false;
      //自定义路由映射方法
      if (options.routeMap && $.isFunction(options.routeMap)){ 
        this._routeMap = options.routeMap; 
        this.customRoute = true;
      }
      //重写parseHash 方法
      if(options.parseHash) this.parseHash = options.parseHash;

			//前缀
			this.prefix = options.prefix || '#';
			hashStrip = new RegExp('^' + this.prefix + '*');

			if (options.defaultHash) this.defaultHash = options.defaultHash;
			if (options.defaultController) this.defaultController = options.defaultController;
			if(options.container) container = options.container;

			this._bindRoutes();
			if (options.initialize) this.initialize = options.initialize; 
			this.initialize.apply(this, arguments);
		},

		//当前状态 {hash: '', params: {}}
		curState : {},
		//路由表生成的正则表达式 数组
		routesAry : [],
    //路由对应的参数
    paramsAry : [],
		// 路由表对应的 操作函数，与routesAry 一一对应
		actions : [],
		
		//初始化方法，由用户重写
		initialize : function(){},

		/*生成页面
		*
		* @hash 要生成页面的 
		*/
		buildPage : function(hash){
			//silent || (silent = true);
      hash = this.cleanHash(hash);
			var id = I.generateId(hash);
			var controller = PAGES[id];
			if(!controller){
				PAGES[id]= controller = this.buildController(hash, {silent : true});
        controller.fetch();
			}
      return controller;
		},

		/**
		* 生成controller 实例,
		* @params 
		* 	hash : 页面hash
		* 	options {state:  状态, silent: 是否需要切换效果，默认false  }, state不传的话，会根据hash自动生成
		*
		* @return
		* 	返回一个controller 实例
		*/
		buildController : function(hash, options){
			var state = options && options.state || this.getState(hash);
			var silent = (options && options.silent === true) ? true : false;
			var controllerName = this._routeMap(hash),
			  id = I.generateId(hash),
				page = document.createElement('div');
			page.id = id;
			var constructor = root[controllerName], controller = null;
			if(!constructor) throw new Error(controllerName + ' does not exist');

			if(constructor.beforeFilter){
				if(constructor.beforeFilter() === true) controller = new constructor({state : state, id : id, page : page, silent : silent});
			}else{
				controller = new constructor({state : state, id : id, page : page, silent : silent});
			} 

      //是否需要重load
      if(controller && constructor.reLoad === true){
        controller.bind('hide', function(){
          this.destroy();
        });
      }
			return controller;
		},

		/**
		* 根据hash，生成一个state
		* @params
		*   hash: hash
		*
		* @return
		* 	{params : params, hash: hash}
		*/
		getState : function(hash){
			var params = this.parseHash(hash);
			return {  params : params,	hash : hash };
		},

		//去掉hash前缀
		cleanHash : function(hash){
      try{
        hash = decodeURI(hash);
      }catch(e){
        
      }
			return hash.replace(hashStrip, '');
		},


		//生成路由表，绑定事件
		_bindRoutes : function() {
      if(this.customRoute !== true){
        if(!this.routes) return;

        var routes = this.routes, regRoute;
        for(var r in routes){
          regRoute = this._routeToRegExp(r);
          this.routesAry.push(regRoute[0]);
          this.paramsAry.push(regRoute[1]);
          this.actions.push(routes[r]);
        }
      }

			if(this.pushState){
				window.addEventListener('popstate', this._popstate.bind(this), false);
			}else if(support.hashchange){
				window.addEventListener('hashchange', this._hashchange.bind(this), false);
			}
			
		},

		//popstate 事件回调
		_popstate : function(e){
			var state = e.state, hash;
			if(state){
				hash = state.hash;
			}else{
			  hash = window.location.hash;
			} 

			I.changePage(hash, {state : state, hashchange : false});
		},

		//hashchange 事件回调
		_hashchange : function(){
			if(changeHashSilent){
				changeHashSilent = false;
				return;
			}

			I.changePage(window.location.hash, { hashchange : false });
		},

		/**
		* 路由匹配，根据hash 匹配到相应的action
		* @params
		* 	hash : 页面hash
		*
		* @return
		* 	对应的controller类，若没找到则返回默认controller
		*/
		_routeMap : function(hash){
      var index = this._match(hash);
			return this.actions[index] || this.defaultController;
		},
 

    /**
    * 根据hash匹配路由
    * @params hash
    *
    * @return 返回路由坐标
    */
    _match: function(hash){
			var routes = this.routesAry, l = routes.length, i;
			for(i = 0; i < l; i++){
				if(routes[i].test(hash)) break;
			}

      return i;
    },

		//将hash分解为参数
    parseHash: function(hash){
      var index = this._match(hash);
      var regRoute = this.routesAry[index], paramsName = this.paramsAry[index], paramsVal, j, len, params = {};
      if(regRoute){
        paramsName = this.paramsAry[index];
        paramsVal = regRoute.exec(hash).slice(1);
        //生成params
        for(j = 0, len = paramsName.length; j < len; j++){
          params[paramsName[j]] = paramsVal[j]; 
        }
      }
      return params;
    },

    /**
		* 将配置的路径转化为正则
		*
		* @params
		* 	route : 对应的路由url
		*
		* @return
		* 	返回url对应的正则表达式
		*/
		_routeToRegExp : function(route) {
      var reg, regRoute, match, params = [];
			reg = route.replace(escapeRegExp, "\\$&")
			  .replace(namedParam, "([^\/]*)")
			  .replace(splatParam, "(.*?)");
      regRoute = new RegExp('^' + reg + '$');

      while((match = namedParam.exec(route)) != null){
        params.push(match[1]);
      }

      return [regRoute, params];
		},

	};

	//历史
	I.History = {
		//是否是返回
		isBack : false,

		//历史记录
		hist : [],

		/**
		* 添加hash至历史记录
		* @params
		*   hash : url hash
		*/
		add : function(hash){
			if(hash == this.hist[1]){
				this.hist.shift();
				this.isBack = true;
			}else{
				this.hist.unshift(hash);
				this.isBack = false;
			}
		},

		//获取当前页面的前一个页面hash
		getPrev : function(){
			return this.hist[1];
		}
	};

	//页面切换队列
	var pageQueue = [];
	var changing = false;
	/**
	* changPage方法
	*
	* @params 
	* 	hash: 页面hash
	* 	options {state : 状态, popstate : 是否由popstate触发的changpage, changehash : 是否需要改变hash}
	*/
	I.changePage = function(hash, options){
		var router = I.Router;
		hash = router.cleanHash(hash);
		if (!hash && router.defaultHash) {
			hash = router.defaultHash;
		}
    
		//页面队列
		if(changing){
			pageQueue.push({hash : hash, options : options});
			return;
		}
		changing = true;

		if(hash == router.curState.hash){ 
      I.end();
      return;
    }

		//记录历史
		I.History.add(router.prefix + hash);

		var state = options && options.state || router.getState(hash); 
		var hashchange = (options && options.hashchange === false) ? false : true;
		if( hashchange ){
			if (router.pushState) {
				window.history.pushState(state, '', router.prefix + hash);
			}else{
				changeHashSilent = true;
				window.location.hash = router.prefix + hash;
			}
		}

		router.curState = state;
		var id = I.generateId(hash), controller = PAGES[id];
		if(controller){
      doComplete(controller);
		}else{
			controller = router.buildController(hash, {state : state, silent : false});
			if(controller){
				PAGES[id] = controller;
				PAGES[id].fetch();
			}else{
        I.end();
      }
		}
	};

  //设置currentController 并执行complete
  //@params
  //  controller 要切换至的controller
  var doComplete = function(controller){
    var previousController = I.currentController;
    I.currentController = controller;
    I.complete(previousController, controller);
  };

	//页面切换完成，必须调用
  I.end = function(){
		changing = false;

		//如果队列中还有需要页面，则执行队列
		if(pageQueue.length > 0){
			var args = pageQueue.shift();
			I.changePage(args.hash, args.options); 
		}
	};


	/**
	* 页面切换
	* @params
	* 	from 起始页面controller
	* 	to 目的页面controller
*/
	I.complete = function(from, to){
		if(from){
			$(from.page).hide()
			from.trigger('hide');
		}

		$(to.page).show();
		to.trigger('show');
    I.end();
	};

  /**
  * 程序启动
  * @params defaultHash 当hash为空时可以跳到defaultHash
  *
  */
  I.start = function(defaultHash){
    var hash = window.location.hash, hashchange = false;
    if(!hash && defaultHash){
      hash = defaultHash;
      hashchange = true
    }

    I.changePage(hash, { hashchange : hashchange });
  };

	I.Model.extend = I.Controller.extend = extend;
	return I;

})(window, jQuery);

if(window.I == undefined) I = Istrap;