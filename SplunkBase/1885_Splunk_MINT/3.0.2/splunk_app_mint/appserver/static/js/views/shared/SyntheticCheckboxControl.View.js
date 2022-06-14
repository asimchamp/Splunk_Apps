define([
    "jquery",
    "underscore",
    "views/shared/controls/SyntheticCheckboxControl",
    "app/contrib/text!app/templates/shared/synthetic-control.template.html"
], function(
    $,
    _,
    SyntheticCheckboxControl,
    SyntheticCheckboxControlTemplate
){

  return SyntheticCheckboxControl.extend({
    template: SyntheticCheckboxControlTemplate
  });

});

