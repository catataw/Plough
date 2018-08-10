import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement(){
    $("#file").pekeUpload({
        url:'?m=Complain&a=addComplainEvidence',
        bootstrap:true,
        onSubmit:true,
        showErrorAlerts:true
      }
    );


  }

});
