
// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return Date.now().toString(16);
};

// Our Store is represented by a single JS object in *localStorage*. Create it
// with a meaningful name, like the name you'd give a table.
var Store = function(name) {
  this.name = name;
  var store = localStorage.getItem(this.name);
  this.data = (store && JSON.parse(store)) || {};
};

$.extend(Store.prototype, {

  // Save the current state of the **Store** to *localStorage*.
  save: function() {
    var success = false;
    try{
      localStorage.setItem(this.name, JSON.stringify(this.data));
      success = true;
    }catch(e){
       //save faile
    }
    return success;
  },

  // have an id of it's own.
  create: function(obj) {
    if (!obj.id) obj.id = guid();
    this.data[obj.id] = obj;
    this.save();
    return obj;
  },

  // Update a model by replacing its copy in `this.data`.
  update: function(obj) {
    this.data[obj.id] = obj;
    return this.save();
  },

  // Retrieve a model from `this.data` by id.
  findById: function(id) {
    return this.data[id];
  },

  // Return the array of all models currently in storage.
  findAll: function() {
    var result = [], data = this.data;
    for(var k in data){
      result.push(data[k]);
    }
    return result;
  },

  // Delete a model from `this.data`, returning it.
  destroy: function(obj) {
    delete this.data[obj.id];
    return this.save();
  }

});
