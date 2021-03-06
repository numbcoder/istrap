# Istrap.js

---

### 简介
Istrap 是一个用于 Web app 开发的 JavaScript 框架，MVC 架构，事件驱动，并有完善的路由机制。
类似与 Rails。Istrap 的 Controller 部分与路由关联，并对应页面中的 DOM 元素，View 部分负责模板管理，Model 则可以与后台接口实现无缝对接。

> 为方便开发，Istrap 提供了方便的简写方式，如 `I.Model`， `I.changePage()`，若`I`命名空间有冲突，可以采用全称 如`Istrap.Model`

### 依赖的第三方库

>  * JQuery 1.7+ 或 Zepto
>  * Mustache
>  * md5 (可选)

### I.Events

框架提供了一个事件模块，可以为任何 `object` 绑定自定义事件，并且可以在任何时机自由地去触发这些事件，也可以在不需要的时候解除事件绑定

示例：

    var object = { foo: 'abc' };
    
    //为 object 扩展事件
    $.extend(object, I.Events);
    
    object.bind('change', function(msg){
      console.log('change '+ msg);
    });
    
    //触发事件
    object.trigger('change', 'foo');
    

#### bind   `object.bind(event, callback, [context])`
给`object` 绑定 事件

> * `event`      事件名
> * `callback`   事件触发的回调函数
> * `context`    回调函数执行环境

示例：

    model.bind('change', this.render, this);

#### one    `object.one(event, callback, [context])`
给`object` 绑定事件，并在事件第一次被触发后，解除绑定（类似于 jquery 的 `one` 方法）

> * `event`  事件名
> * `callback`  事件触发的回调函数
> * `context`  回调函数执行环境


#### unbind    `object.unbind(event, [callback])`
解除事件绑定

> * `event` 事件名。当event为空时，会解除 object 上所有的事件绑定
> * `callback`  要解除绑定的回调函数名， 如果为空，所有关于此 event 事件的回调绑定都会被解除

示例：

    object.unbind("change", onChange);  // 解除 "change" 事件的 onChange 回调函数

    object.unbind("change");            // 解除 "change" 事件的所有回调函数

    object.unbind();                    // 解除 `object` 的所有事件绑定



#### trigger    `object.trigger(event, [*args])`
触发某个事件，并且可以传递参数到回调函数中

    object.trigger('change', arg1, arg2);
    



### I.Model
`Model` 部分基本实现Javascript 的OO，可以帮你更好的组织代码, Model中已经实现了一些方法,
并且改变一个 model 的属性时会触发一系列的`change`事件。
新建立一个 model 只需从 `I.Model` 继承

    var User = I.Model.extend({
      defaults:{ age : 23 },

      getFullName: function(){
        return this.get('firstName') +' '+ this.get('lastName');
      }
    });

    var user = new User({firstName: 'John', lastName: 'Green'});

    user.get('firstName');    // "John"
    user.get('age');          // 23
    user.getFullName();       // "John Green"

    user.bind('change:age', function(model, age){
       console.log('new age is' + age);
    });

    user.set({age: 28});  // "change:age" 事件将会被触发
    user.get('age');      // 28


**Model** 部分分为 **实例方法** 和 **类方法**

    var User = I.Model.extend({
      //实例方法
      getFullName: function(){
        return this.firstName +' '+ this.lastName;
      }
    },{
      //类方法
      all: function(){
        //get data form server
      }
    });

    var user = new User({fisrtName: 'John', lastName: 'Green'});

    user.getFullName();    // 实例方法调用
    User.all();            // 类方法调用


#### extend `I.Model.extend(properties, [classProperties])`
新建一个 model 方式，就是调用 `I.Model.extend()`

> * `properties` 实例属性和方法
> * `classProperties` 类属性和方法


#### attributes
实例对象(model) 的所有属性都存在于 `attributes` 中, 可以通过 `model.attributes` 调用


#### defaults
实例对象的默认属性

    var User = I.Model.extend({
      defaults:{
        age: 24
      }
    });
 
    var user = new User;
    user.get('age');     // 24

`defaults` 也可以是一个 `function`

    var User = I.Model.extend({
      defaults: function(){
        return { createAt: Date.now() };
      }
    });


#### initialize `initialize()`
实例方法，实例化时会被执行，默认是空方法，可以根据需要自己实现

#### get `get(attr)`
实例方法，获取属性值

    user.get('age');   //获取用户age


#### set `set(attrs, options)`
实例方法，设置属性，如果属性有改变会默认会触发 `"change"` 事件

> * `attrs` 是一个object对象
> * `options` 设置项。如果设置 `{silent: true}`，将不会触发 `"change"` 事件

    var user = new User({name: 'John'});

    //下面会触发 "change:name", "change:age", "change" 三个事件
    user.set({name: 'Tom', age: 23});

    //设置 {silent: true}，不会触发任何事件
    user.set({name: 'Jerry', age: 15}, {silent: true});



### I.Controller
`Controller` 主要是负责页面渲染，事件绑定。可以是每一个 `page` 对应一个`Controller`，
也可以是指定的一个 `Dom` 区域对应一个`Controller`

    var IndexController = I.Controller.extend({
      events: {
        'click .leftButton' : 'goBack',
        'click span.edit'   : 'edit'
      },

      goBack: function(event, dom){
        //do something
      },

      edit: function(){
        //do something
      }
    });

Controller 有一些**类属性**和**实例属性**

>##### 实例属性及配置
> * `id` controller对应的dom id
> * `state` object对象，{hash: controller对应的hash,  params: hash 经解析后的参数 }
> * `page`  controller 对应的dom 对象
> * `pageSelector` （配置）如果当前dom 已经存在于页面中并且是自己创建`Controller`实例，则需要配置一个选择器，如 `#header`
> * `container` （配置）当前dom 将被插入到这个容器中，如不配置，将启用全局`container` 
> * `events` （配置） 批量绑定事件。可以委托的事件将会采用委托的方式在页面渲染前进行绑定, 如果不能委托的事件将会在页面渲染好之后进行绑定
> * `className` （配置） 有配置后会自动加在当前 dom 上


>##### 类属性及配置
> * `template`（配置） 对应的 `view` 模板
> * `reLoad`（配置）设置为 ture 后，当前 controller 和 页面会每次都 重新取数据并渲染
> * `beforeFilter`（配置）一个方法，根据返回值`true` 或 `false`，决定是否要创建页面，可以用来检查登录等

    var IndexController = I.Controller.extend({
      events: {
        'click .leftButton'  : 'goBack',
        'click span.edit'  : 'edit'
      },

      customEvents:{
        'submit form'  : 'submit'
      },

      className: 'class1 class2'
    },
    {
      template: View.index,         //设置模板  
      reload: true,                 //每次动重新渲染
      beforeFilter: function(){
        if(!login) return false;

        return true;
      }
    });

创建一个 `Controller` 实例，

    new IndexController({ silent: true });

设置 silent 为 true，当前创建的 dom 不做任何显示或动画效果


#### initialize
实例方法，`Controller`实例化时会被执行，默认是空方法，可以根据需要自己实现

#### fetch
实例方法，在需要需要从后端取数据来渲染模板时，要重写 `fetch` 方法，并调用 `render` 方法

#### render `render([data], [template], [partial])`
实例方法，`fetch` 取的数据后会调用 `render` 来渲染模板的。

`render` 中会调用 `Mustache` 的方法进行模板渲染

不需要传入数据时，data 可以为空。在类属性中配置了 template 后，template 参数为空时，会调用类属性的 `template`

`render` 方法可以被重写，被重写后需在最后调用 `this._create()`

#### destroy
实例方法。删除当前页面和 Controller 实例

#### $
实例方法。一个 jQuery 的引用。查找范围是在当前 page 中


### View
view 部分采用了 Mustache 作为默认模板引擎，每一个 Controller 对应一个模板

模板可以自由组织，既可以采用 json 格式，也可是单独文件方式。只需在对应的 Controller 中配置好。


### I.Router
Router 主要负责对浏览器url hash的监听以及 跳转控制

#### init `init(options)`
init 是整个程序初始化方法，其中 `options` 是配置

>`options` 配置项如下：

> * `prefix` hash前缀，默认是`"#"`
> * `routes` 路由配置
> * `pushState` 是否启用pushstate，默认是true，设为false后，将启用`hashchange`监听url
> * `container` Controller 的默认dom 容器

    I.Router.init({
      prefix: '#!/',
      routes: {
        'home'          : 'Home',
        'users/p:page'  : 'List',
        'user/:id/show' : 'Show'
      },
      pushState: false,

      container: '#container'
    });

路由解析是基于完全匹配的方式，参数是由 `:` 标示

如 路由配置 `"search/:query/p:page"` ，只能严格匹配如 "search/foo/p23"，无法匹配 "search/foo/" 或 "search/foo/p:23/bar"，其中解析出来的参数为`{query: "foo", page: "23"}`

对于特殊的url hash结构，例如 `#app=ipad&category=12&page=2` 等，可以自己实现解析方案。

可以通过重写 `routeMap` 和 `parseHash` 方法实现自己的路由解析方案。

其中`routeMap` 主要实现路由解析

    var routeMap = function(hash){

      // ...

      return controllerName;  //返回hash 所对应的 controller 名字
    };

`parseHash` 方法主要实现**参数解析**

    var parseHash = function(hash){

      // ...

      return params;  //返回一个object 对象, 如{id: 1, page: 2}
    };


重写路由解析模块后，可加入到init配置中，实现重写

    I.Router.init({
      ...

      routeMap: routeMap,
      parseHash: parseHash
    });

#### buildPage `buildPage(hash)`
生成 hash 对应的 controller 和页面并插入到容器中，但不做任何显示或动画效果。不触发`controller`的 `"show"` 事件，
可用于页面的预加载等。


### I.generateId
id 生成策略，框架默认是采用`md5`加密当前 url hash 方式生成页面唯一ID

也可以通过重写此方法来实现自定义`id`生成策略，去除对 `md5` 库的依赖


### I.History
历史记录

#### isBack
可以通过 `I.History.isBack` 来判断当前页面相对于前一个页面是否是后退。如果为 `true` 则表示后退


#### getPrev
获取前一个页面hash

    I.History.getPrev();


### I.changePage

`I.changePage(hash, [options])` 方法主要是用来页面切换

> * `hash` url hash
> * `options` 额外配置, 设置{hashchange: false}, 将只切页面，而不改变浏览器 hash 

启用pushState时, 在mobile safari下，建议将所有的`a`标签默认跳转禁用，然后用I.changePage(hash)， 进行跳转 


### I.complete
`I.complete(from, to)` 主要用来控制页面切换

> * `from` 页面切换的开始页的 controller
> * `to` 页面切换目的页的 controller

如果要自定义页面动画效果，可以通过重写这个方法来实现。重写时注意要触发 `from`的`"hide"`事件和`to`的`"show"`事件, 并且在最后调用 `I.end();`

    I.complete = function(from, to){
      // ...
      from.trigger('hide');
      // ...
      to.trigger('show');
      // ...

      I.end();
    };

### I.start
`I.start([hash])`, 此方法是整个应用程序的启动方法, 可以传入一个`hash` 参数，作为默认hash(当url hash为空时，会跳到此默认hash)

