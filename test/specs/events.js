describe('A Object mixin with I.Events', function(){
  var Obj;

  beforeEach(function(){
    var user = {name: 'John', age: 28};
    Obj = I.extend(user, I.Events);
  });

  it('has a methods named bind', function(){
    expect(Obj.bind).toBeDefined();   
  });

  it('has a methods named one', function(){
    expect(Obj.one).toBeDefined();
  });

  it('has a methods named unbind', function(){
    expect(Obj.unbind).toBeDefined();
  });

  it('has a methods named trigger', function(){
     expect(Obj.trigger).toBeDefined();
  });


  it('can bind events and trigger events', function(){
    var triggered = false, args;

    Obj.bind('evt', function(){
      triggered = true;
      args = Array.prototype.slice.call(arguments, 0);
    });

    Obj.trigger('evt', 'a', 'b');

    expect(triggered).toBeTruthy();
    expect(args[0]).toEqual('a');
    expect(args[1]).toEqual('b');
  });

  it('can bind events once with one method', function(){
    var triggered = false, triggerCount = 0, args;

    Obj.one('evt', function(){
      triggered = true;
      args = Array.prototype.slice.call(arguments, 0);
      triggerCount ++;
    });

    Obj.trigger('evt', 'a', 'b');

    expect(triggered).toBeTruthy();
    expect(args[0]).toEqual('a');
    expect(args[1]).toEqual('b');
    expect(triggerCount).toEqual(1);

    Obj.trigger('evt');
    expect(triggerCount).toNotEqual(2);
    expect(triggerCount).toEqual(1);
  });

  it('can unbind events', function(){
    var f1 = f2 = 0;

    var func1 = function(){
      f1 ++;
    };
    var func2 = function(){
      f2 ++;
    };

    Obj.bind('evt', func1);
    Obj.bind('evt', func2);

    Obj.trigger('evt');
    expect(f1).toEqual(1);
    expect(f2).toEqual(1);

    Obj.unbind('evt', func1);
    Obj.trigger('evt');
    expect(f1).toNotEqual(2);
    expect(f1).toEqual(1);
    expect(f2).toEqual(2);

    Obj.unbind('evt');
    Obj.trigger('evt');
    expect(f1).toNotEqual(2);
    expect(f1).toEqual(1);
    expect(f2).toEqual(2);
    expect(f2).toNotEqual(3);
  });

});