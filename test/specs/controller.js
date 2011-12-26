describe('Controller', function(){

  var dom = '\
    <div id="test-controller" style="position: absolute; top: -1000px">\
      <div class="test-click">click</div>\
      <div class="test-custom-event">eventA</div>\
      <form class="test-submit">\
        <input type="text" name="" >\
      </form>\
    </div>\
  ';

  $('body').append(dom);

  var eventName;

  var TestController = I.Controller.extend({
      events:{
        'click .test-click' : 'testClick',
        'submit .test-submit' : 'testSubmit',
        'eventA .test-custom-event' : 'testCustomEvent'
      },

      pageSelector: '#test-controller',

      testClick: function(){
        eventName = "click event is triggered";
      },

      testSubmit: function(e){
        e.preventDefault();
        eventName = "submit event is triggered";
        //return false;
      },

      testCustomEvent: function(){
        eventName = "eventA is triggered";
      }
    });

  beforeEach(function(){
    //var page = document.createElement('div');
  });

  describe('can bind events', function(){
    
    var con;

    beforeEach(function(){
      con = new TestController();
      eventName = "";
    });

    it('will trigger click event', function(){
      $('.test-click', con.page).trigger('click');
      expect(eventName).toBe("click event is triggered");
    });

    it('will trigger submit event', function(){
      $('.test-submit', con.page).trigger('submit');
      expect(eventName).toBe("submit event is triggered");
    });

    it('will trigger a custom event', function(){
      $('.test-custom-event', con.page).trigger('eventA');
      expect(eventName).toBe("eventA is triggered");
    });

    it("constructor has detected events and customEvents", function(){
      var klass = con.constructor;
      expect(klass.isDetected).toBeTruthy();
      expect(klass.events['click .test-click']).toBe('testClick');
      expect(klass.events['submit .test-submit']).toBe('testSubmit');
      expect(klass.events['eventA .test-custom-event']).not.toBe('testCustomEvent');
      expect(klass.events['eventA .test-custom-event']).toBeUndefined();

      //custom events
      expect(klass.customEvents['eventA .test-custom-event']).toBe('testCustomEvent');
      expect(klass.customEvents['submit .test-submit']).not.toBe('testSubmit');
      expect(klass.customEvents['submit .test-submit']).toBeUndefined();
    });
   
  });
});