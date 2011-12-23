describe("Framework", function(){
  
  it("namespace shoule be Istrap and I", function(){
    expect(Istrap).toBeDefined();
    expect(I).toBeDefined();
  });

  it('function can be bind a object', function(){
    var obj = {foo: 'abc', bar: 12};

    var func = function(a, b){
      expect(this.foo).toEqual('abc');
      expect(this.bar).toEqual(12);

      expect(a).toEqual('arg1');
      expect(b).toEqual('arg2');
    };

    expect(func.bind).toBeDefined();

    var f = func.bind(obj, 'arg1');
    f('arg2');
  });

  it('function can be bind a object and the execute env will be the second argument', function(){
    var obj = {foo: 'abc', bar: 12};
    var env = {a : 23};

    var func = function(a, b, c){
      expect(this.foo).toEqual('abc');
      expect(this.bar).toEqual(12);

      expect(a).toEqual('arg1');
      //执行环境的this
      expect(b).toBe(env);
      expect(c).toEqual('arg2');
      //console.log(b);
    };

    expect(func._bind).toBeDefined();

    var f = func._bind(obj, 'arg1');
    f.call(env, 'arg2');
  });

  it('Events is define', function(){
    expect(I.Events).toBeDefined();
  });

  it('Model is define', function(){
    expect(I.Model).toBeDefined();
    expect(I.Model.extend).toBeDefined();
  });

  it('Controller is define', function(){
    expect(I.Controller).toBeDefined();
    expect(I.Controller.extend).toBeDefined();
  });

  it('has a extend method', function(){
    expect(I.extend).toBeDefined();
    var obj1 = {a: 1, b: 2};
    var obj2 = {b: 3, c: 4};
    var obj3 = {d: 'd'};
    var obj4 = {a: 1, b: 3, c: 4, d: 'd'};

    var result = I.extend(obj1, obj2, obj3);
    expect(result.a).toEqual(1);
    expect(result.b).toEqual(3);
    expect(result.c).toEqual(4);
    expect(result.d).toEqual('d');
    //console.log(jasmine.Matchers.prototype);
  });
  

});
