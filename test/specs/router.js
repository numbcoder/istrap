describe('Router' ,function(){
  var Router  = I.Router;

  Router.init({
    prefix: '#!/',
    //路由
    routes : {
      'home': 'Home',
      'user/:id' : 'userShow',
      'users/:name/p:page' : 'userList',
      'contacts/page/:page' : 'Contacts'
    },

    defaultController: 'default'
  });

  beforeEach(function(){
    this.addMatchers({
      toBeSame: function(expected) {
        var compare = function(A, B){
          var result = true;
          for(var k in A){
            if(!(k in A) || A[k] !== B[k]){
              result = false;
              break;
            }
          }
          return result;
        };

        return compare(expected, this.actual) && compare(this.actual, expected);
      }
    });
  });

  it('can clean a dirty hash', function(){
    expect(Router.cleanHash('#!/user/23')).toEqual('user/23');

    expect(Router.cleanHash('#!user/23')).toEqual('user/23');

    expect(Router.cleanHash('user/23')).toEqual('user/23');
  });

  it('can convert routes to Reg Machter', function(){
    var result = Router._routeToRegExp('users/:name/p/:page');

    expect('users/john/p/23').toMatch(result[0]);
    expect('userss/john/p/23').not.toMatch(result[0]);
    expect('users/john/pp/23').not.toMatch(result[0]);

    expect(result[1]).toBeSame(['name', 'page']);
  });

  it('can parse a hash to params', function(){
    expect(Router.parseHash('users/john/p23')).toBeSame({name: 'john', page: '23'});

    expect(Router.parseHash('user/45')).toBeSame({ id: '45'});

    expect(Router.parseHash('contacts/page/12')).toBeSame({ page: '12'});
    expect(Router.parseHash('contacts/user/12')).not.toBeSame({ page: '12'});

    expect(Router.parseHash('home')).toBeSame({ });

  });

  it('can map a hash to a controller name', function(){
    expect(Router._routeMap('home')).toEqual('Home');

    expect(Router._routeMap('user/342')).toEqual('userShow');

    expect(Router._routeMap('users/john/p:21')).toEqual('userList');

    expect(Router._routeMap('contacts/page/42')).toEqual('Contacts');

    expect(Router._routeMap('post/42')).toEqual('default');
  });

  describe('History', function(){
    var History = I.History;

    beforeEach(function(){
      History.hist = [];
    });

    it('can add a item to hist', function(){
      History.add('user/1');
      expect(History.hist).toBeSame(['user/1']);
      expect(History.isBack).toBeFalsy();

      History.add('user/3');
      expect(History.hist).toBeSame(['user/3', 'user/1']);
      expect(History.isBack).toBeFalsy();

      History.add('user/1');
      expect(History.hist).toBeSame(['user/1']);
      expect(History.isBack).toBeTruthy();
    });

    it('can get the preview history', function(){
      History.add('user/1');
      expect(History.getPrev()).toBeUndefined();

      History.add('user/3');
      expect(History.getPrev()).toEqual('user/1');
    });

  });

});
