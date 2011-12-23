describe("Model", function(){
  var User, user;
  
  beforeEach(function(){
    User = I.Model.extend({
      defaults:{ age : 23 },

      getFullName: function(){
        return this.get('firstName') +' '+ this.get('lastName');
      }
    },{
      all: function(){
        //may be get data form server
        //return [];
      }
    });

    user = new User({firstName: 'John', lastName: 'Green'});
  });
  
  it('Instance should have a get property method', function(){
    expect(user.get('age')).toEqual(23);
    expect(user.get('firstName')).toEqual('John');
  });

  it('Instance should have a set property method', function(){
    user.set({age: 15, sex: 'male', lastName: 'Roge'});

    expect(user.get('age')).toEqual(15);
    expect(user.get('firstName')).toEqual('John');
    expect(user.get('lastName')).toEqual('Roge');
    expect(user.get('sex')).toEqual('male');

  });

  it('has instance method', function(){
    expect(user.getFullName()).toEqual('John Green');
  });

  it('change property will trigger change event', function(){
    var triggerCount = 0;
    user.bind('change:age', function(model, age){
      expect(age).toEqual(28);
      expect(user.get('age')).toEqual(28);
      triggerCount ++;
    });

    user.bind('change', function(){
      expect(user.get('age')).toEqual(28);
      triggerCount ++;
    });

    user.set({age: 28});
    expect(user.get('age')).toEqual(28);
    expect(triggerCount).toEqual(2);
  });
  
  it('should has Class method', function(){
    expect(User.all).toBeDefined();
  });
  
});
