//程序启动配置
var config = {
  prefix: '#!/',
  //路由
  routes : {
    'contacts' : 'Index',
    'contact/:id/show' : 'Show',
    'contact/:id/edit' : 'Edit',
    'contacts/new' : 'Add'
  },

  //不启用pushState
  //pushState: false,

  //默认dom容器
  container: '#scroller'
}

//模板
var tmpl = {
  list : '\
    <header><h1>Contacts</h1><a href="#!/contacts/new" class="button add">+</a></header>\
    <ul>\
      {{#list}}\
        <li data-href="#!/contact/{{id}}/show">{{name}}</li>\
      {{/list}}\
    </ul>\
  ',

  add : '\
    <header><h1>Contacts</h1><a href="#!/contacts" class="button leftButton cancel-btn">取消</a><a href="#!/contacts" class="button submit-btn">确定</a></header>\
    <form class="add-contact">\
      <ul class="rounded">\
        <li><label>姓名:</label><input type="text" placeholder="John Resig" name="name" class="name" value="{{name}}"></li>\
        <li><label>邮箱:</label><input type="email" placeholder="john@gmail.com" name="email" class="email" value="{{email}}"></li>\
        <li><label>电话:</label><input type="number" placeholder="12345" name="phone" class="phone" value="{{phone}}"></li>\
      </ul>\
    </form>\
  ',

  show: '\
    <header><h1>Contacts</h1><a href="#!/contacts" class="button leftButton back-btn">返回</a><a href="#!/contact/{{id}}/edit" class="button edit-btn">编辑</a></header>\
    <ul class="rounded">\
      <li><label>姓名:</label> {{name}}</li>\
      <li><label>邮箱:</label> {{email}}</li>\
      <li><label>电话:</label> {{phone}}</li>\
    </ul>\
  '
};



//Contact Model
var Contact = I.Model.extend({
  //实例方法save
  save : function(){
    this.constructor.save(this.attributes);
  }
},
{
  //本地存储
  storage : new Store('contacts'),

  save: function(obj){
    this.storage.create(obj);
  },

  create: function(obj){
    return new this(this.save(obj));
  },

  findById : function(id){
    var obj = this.storage.findById(id);
    if(obj){
      return new this(obj);
    }
  },

  all : function(){
    return this.storage.findAll();
  }

});

var Index = I.Controller.extend({
  //绑定事件
  customEvents: {
    'click li'    : 'itemShow',
    'click a.add' : 'addContact'
  },

  addContact: function(e, dom){
    e.preventDefault();
    I.changePage('contacts/new');
  },

  itemShow: function(e, dom){
    e.preventDefault();
    var href = $(dom).data('href');
    if(href) I.changePage(href);
  },


  fetch: function(){
    var contacts = Contact.all();
    //console.log(contacts);
    this.render({list : contacts}, tmpl.list);
  },

}, 
{
  reLoad: true
});

var Add = I.Controller.extend({
  //绑定事件
  customEvents:{
    'submit form': 'submit',
    'click header a.cancel-btn' : 'cancel',
    'click header a.submit-btn' : 'submit'
  },

  initialize: function(){
    this.bind('show', this.show);
  },

  show: function(){
    this.$('input.name').focus();
  },

  submit: function(e){
    e.preventDefault();
    var $form = this.$('.add-contact');
    var name = $form.find('.name').val();
    var email = $form.find('.email').val();
    var phone = $form.find('.phone').val();
    Contact.create({name:name, email: email, phone: phone});
    I.changePage('contacts');
  },

  cancel: function(e){
    e.preventDefault();
    I.changePage('contacts');
  },

  fetch: function(){
    this.render({}, tmpl.add);
  }
});

var Show = I.Controller.extend({
  customEvents:{
    'click header a.back-btn': 'goBack',
    'click header a.edit-btn': 'edit'
  },

  goBack: function(e){
    e.preventDefault();
    I.changePage('contacts');
  },

  edit: function(e, dom){
    e.preventDefault();
    I.changePage($(dom).attr('href'));
  },

  fetch: function(){
    //console.log(this.state);
    var contact = Contact.findById(this.state.params.id);
    this.render(contact.attributes, tmpl.show);
  }
},{
  reLoad: true
});

var Edit = I.Controller.extend({
  customEvents:{
    'submit form': 'submit',
    'click header a.cancel-btn' : 'cancel',
    'click header a.submit-btn' : 'submit'
  },

  initialize: function(){
    this.bind('show', this.show);
  },

  show: function(){
    this.$('input.name').focus();
  },

  cancel: function(e){
    e.preventDefault();
    I.changePage('#!/contact/'+ this.state.params.id +'/show');
  },

  fetch: function(){
    this.contact = Contact.findById(this.state.params.id);
    this.render(this.contact.attributes, tmpl.add);
  },
  submit: function(e, dom){
    var $form = this.$('form.add-contact');
    var name = $form.find('.name').val();
    var email = $form.find('.email').val();
    var phone = $form.find('.phone').val();
    this.contact.set({name:name, email: email, phone: phone});
    this.contact.save();
    I.changePage('#!/contact/'+ this.state.params.id +'/show');
  },

});


$(function(){
  I.Router.init(config);
  I.start('#!/contacts');
});
