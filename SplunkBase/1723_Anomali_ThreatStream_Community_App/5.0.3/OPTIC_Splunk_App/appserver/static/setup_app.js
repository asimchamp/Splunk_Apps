(function($) {
 	$.each(['show', 'hide'], function(i, ev) {
		var el = $.fn[ev];
		$.fn[ev] = function() {
			this.trigger(ev);
			return el.apply(this, arguments);
		};
	});
})(jQuery);
window.onload = function(){
   var labels = document.getElementsByTagName('label');
   for(i = 0; i < labels.length; i++){
      if(labels[i].getAttribute('for').indexOf('apikey_id_confirm') != -1)
        labels[i].innerHTML = 'Confirm API Key';
      if(labels[i].getAttribute('for').indexOf('proxy_password_id_confirm') != -1)
        labels[i].innerHTML = 'Confirm Proxy Password';
      if(labels[i].getAttribute('for').indexOf('user_password_id_confirm') != -1)
        labels[i].innerHTML = 'Confirm Password';
	  if(labels[i].getAttribute('for').indexOf('eula_ack_id') != -1)
        labels[i].innerHTML = 'I agree to <a href="https://www.anomali.com/terms-of-service" target="_blank">Terms of Use</a> and <a href="https://www.anomali.com/privacy-policy" target="_blank">Privacy Policy</a>';
    }
    $('div[id$="item-blockFieldset-1"]').hide(); // hide root url

    // new customer
    var new_checkbox = $('input[name$="/mycustom/customendpoint/setupentity/new_cust"]');
    // default box: existing customer
    var exist_checkbox = $('input[name$="/mycustom/customendpoint/setupentity/exist_cust"]');
    $(exist_checkbox).attr('checked',true);

    //add hyperlink to sign up if new customer
    var signin_div = $('div[id$="item-blockFieldset-3"]');
    var signup_div = $('div[id$="item-blockFieldset-4"]');
    signup_div.hide();

    function reset_inputs(inputEle) {
      var inputs = inputEle[0].getElementsByTagName('input');
      for(var i = 0; i < inputs.length; i++) {
        $(inputs[i]).val("");
        $(inputs[i]).next('.widgeterror').hide();
      }
    }

    // Add onchange event handler to toggle between existing customer and new customer login/signup
    new_checkbox.change(function() {
        var ischecked = $(this).is(":checked");
        exist_checkbox.attr('checked', !ischecked);
        if(ischecked) {
          signin_div.hide();
          signup_div.show();
          reset_inputs(signin_div);
        } else {
          signin_div.show();
          signup_div.hide();
          reset_inputs(signup_div);
          $('select.country_dropdown').val('');
        }
    });

    exist_checkbox.change(function() {
        var ischecked = $(this).is(":checked");
        new_checkbox.attr('checked', !ischecked);
        if(ischecked) {
          signup_div.hide();
          signin_div.show();
          reset_inputs(signup_div);
          $('select.country_dropdown').val('');
        } else {
          signup_div.show();
          signin_div.hide();
          reset_inputs(signin_div);
        }
    });
    
    // lookup for countries
    var user_country = $('input[id$="/mycustom/customendpoint/setupentity/user_country_id"]');
    user_country.parent()[0].innerHTML = '<select class="country_dropdown" id="/mycustom/customendpoint/setupentity/user_country_id" name="/mycustom/customendpoint/setupentity/user_country"><option value="">- Please Select -</option><option value="US">United States</option><option value="AF">Afghanistan</option><option value="AX">Åland Islands</option><option value="AL">Albania</option><option value="DZ">Algeria</option><option value="AS">American Samoa</option><option value="AD">Andorra</option><option value="AO">Angola</option><option value="AI">Anguilla</option><option value="AQ">Antarctica</option><option value="AG">Antigua and Barbuda</option><option value="AR">Argentina</option><option value="AM">Armenia</option><option value="AW">Aruba</option><option value="AU">Australia</option><option value="AT">Austria</option><option value="AZ">Azerbaijan</option><option value="BS">Bahamas</option><option value="BH">Bahrain</option><option value="BD">Bangladesh</option><option value="BB">Barbados</option><option value="BY">Belarus</option><option value="BE">Belgium</option><option value="BZ">Belize</option><option value="BJ">Benin</option><option value="BM">Bermuda</option><option value="BT">Bhutan</option><option value="BO">Bolivia, Plurinational State of</option><option value="BQ">Bonaire, Sint Eustatius and Saba</option><option value="BA">Bosnia and Herzegovina</option><option value="BW">Botswana</option><option value="BV">Bouvet Island</option><option value="BR">Brazil</option><option value="IO">British Indian Ocean Territory</option><option value="BN">Brunei Darussalam</option><option value="BG">Bulgaria</option><option value="BF">Burkina Faso</option><option value="BI">Burundi</option><option value="KH">Cambodia</option><option value="CM">Cameroon</option><option value="CA">Canada</option><option value="CV">Cape Verde</option><option value="KY">Cayman Islands</option><option value="CF">Central African Republic</option><option value="TD">Chad</option><option value="CL">Chile</option><option value="CN">China</option><option value="CX">Christmas Island</option><option value="CC">Cocos (Keeling) Islands</option><option value="CO">Colombia</option><option value="KM">Comoros</option><option value="CG">Congo</option><option value="CD">Congo, the Democratic Republic of the</option><option value="CK">Cook Islands</option><option value="CR">Costa Rica</option><option value="CI">Côte d\'Ivoire</option><option value="HR">Croatia</option><option value="CU">Cuba</option><option value="CW">Curaçao</option><option value="CY">Cyprus</option><option value="CZ">Czech Republic</option><option value="DK">Denmark</option><option value="DJ">Djibouti</option><option value="DM">Dominica</option><option value="DO">Dominican Republic</option><option value="EC">Ecuador</option><option value="EG">Egypt</option><option value="SV">El Salvador</option><option value="GQ">Equatorial Guinea</option><option value="ER">Eritrea</option><option value="EE">Estonia</option><option value="ET">Ethiopia</option><option value="FK">Falkland Islands (Malvinas)</option><option value="FO">Faroe Islands</option><option value="FJ">Fiji</option><option value="FI">Finland</option><option value="FR">France</option><option value="GF">French Guiana</option><option value="PF">French Polynesia</option><option value="TF">French Southern Territories</option><option value="GA">Gabon</option><option value="GM">Gambia</option><option value="GE">Georgia</option><option value="DE">Germany</option><option value="GH">Ghana</option><option value="GI">Gibraltar</option><option value="GR">Greece</option><option value="GL">Greenland</option><option value="GD">Grenada</option><option value="GP">Guadeloupe</option><option value="GU">Guam</option><option value="GT">Guatemala</option><option value="GG">Guernsey</option><option value="GN">Guinea</option><option value="GW">Guinea-Bissau</option><option value="GY">Guyana</option><option value="HT">Haiti</option><option value="HM">Heard Island and McDonald Islands</option><option value="VA">Holy See (Vatican City State)</option><option value="HN">Honduras</option><option value="HK">Hong Kong</option><option value="HU">Hungary</option><option value="IS">Iceland</option><option value="IN">India</option><option value="ID">Indonesia</option><option value="IR">Iran, Islamic Republic of</option><option value="IQ">Iraq</option><option value="IE">Ireland</option><option value="IM">Isle of Man</option><option value="IL">Israel</option><option value="IT">Italy</option><option value="JM">Jamaica</option><option value="JP">Japan</option><option value="JE">Jersey</option><option value="JO">Jordan</option><option value="KZ">Kazakhstan</option><option value="KE">Kenya</option><option value="KI">Kiribati</option><option value="KP">Korea, Democratic People\'s Republic of</option><option value="KR">Korea, Republic of</option><option value="KW">Kuwait</option><option value="KG">Kyrgyzstan</option><option value="LA">Lao People\'s Democratic Republic</option><option value="LV">Latvia</option><option value="LB">Lebanon</option><option value="LS">Lesotho</option><option value="LR">Liberia</option><option value="LY">Libya</option><option value="LI">Liechtenstein</option><option value="LT">Lithuania</option><option value="LU">Luxembourg</option><option value="MO">Macao</option><option value="MK">Macedonia, the former Yugoslav Republic of</option><option value="MG">Madagascar</option><option value="MW">Malawi</option><option value="MY">Malaysia</option><option value="MV">Maldives</option><option value="ML">Mali</option><option value="MT">Malta</option><option value="MH">Marshall Islands</option><option value="MQ">Martinique</option><option value="MR">Mauritania</option><option value="MU">Mauritius</option><option value="YT">Mayotte</option><option value="MX">Mexico</option><option value="FM">Micronesia, Federated States of</option><option value="MD">Moldova, Republic of</option><option value="MC">Monaco</option><option value="MN">Mongolia</option><option value="ME">Montenegro</option><option value="MS">Montserrat</option><option value="MA">Morocco</option><option value="MZ">Mozambique</option><option value="MM">Myanmar</option><option value="NA">Namibia</option><option value="NR">Nauru</option><option value="NP">Nepal</option><option value="NL">Netherlands</option><option value="NC">New Caledonia</option><option value="NZ">New Zealand</option><option value="NI">Nicaragua</option><option value="NE">Niger</option><option value="NG">Nigeria</option><option value="NU">Niue</option><option value="NF">Norfolk Island</option><option value="MP">Northern Mariana Islands</option><option value="NO">Norway</option><option value="OM">Oman</option><option value="PK">Pakistan</option><option value="PW">Palau</option><option value="PS">Palestinian Territory, Occupied</option><option value="PA">Panama</option><option value="PG">Papua New Guinea</option><option value="PY">Paraguay</option><option value="PE">Peru</option><option value="PH">Philippines</option><option value="PN">Pitcairn</option><option value="PL">Poland</option><option value="PT">Portugal</option><option value="PR">Puerto Rico</option><option value="QA">Qatar</option><option value="RE">Réunion</option><option value="RO">Romania</option><option value="RU">Russian Federation</option><option value="RW">Rwanda</option><option value="BL">Saint Barthélemy</option><option value="SH">Saint Helena, Ascension and Tristan da Cunha</option><option value="KN">Saint Kitts and Nevis</option><option value="LC">Saint Lucia</option><option value="MF">Saint Martin (French part)</option><option value="PM">Saint Pierre and Miquelon</option><option value="VC">Saint Vincent and the Grenadines</option><option value="WS">Samoa</option><option value="SM">San Marino</option><option value="ST">Sao Tome and Principe</option><option value="SA">Saudi Arabia</option><option value="SN">Senegal</option><option value="RS">Serbia</option><option value="SC">Seychelles</option><option value="SL">Sierra Leone</option><option value="SG">Singapore</option><option value="SX">Sint Maarten (Dutch part)</option><option value="SK">Slovakia</option><option value="SI">Slovenia</option><option value="SB">Solomon Islands</option><option value="SO">Somalia</option><option value="ZA">South Africa</option><option value="GS">South Georgia and the South Sandwich Islands</option><option value="SS">South Sudan</option><option value="ES">Spain</option><option value="LK">Sri Lanka</option><option value="SD">Sudan</option><option value="SR">Suriname</option><option value="SJ">Svalbard and Jan Mayen</option><option value="SZ">Swaziland</option><option value="SE">Sweden</option><option value="CH">Switzerland</option><option value="SY">Syrian Arab Republic</option><option value="TW">Taiwan, Province of China</option><option value="TJ">Tajikistan</option><option value="TZ">Tanzania, United Republic of</option><option value="TH">Thailand</option><option value="TL">Timor-Leste</option><option value="TG">Togo</option><option value="TK">Tokelau</option><option value="TO">Tonga</option><option value="TT">Trinidad and Tobago</option><option value="TN">Tunisia</option><option value="TR">Turkey</option><option value="TM">Turkmenistan</option><option value="TC">Turks and Caicos Islands</option><option value="TV">Tuvalu</option><option value="UG">Uganda</option><option value="UA">Ukraine</option><option value="AE">United Arab Emirates</option><option value="GB">United Kingdom</option><option value="US">United States</option><option value="UM">United States Minor Outlying Islands</option><option value="UY">Uruguay</option><option value="UZ">Uzbekistan</option><option value="VU">Vanuatu</option><option value="VE">Venezuela, Bolivarian Republic of</option><option value="VN">Viet Nam</option><option value="VG">Virgin Islands, British</option><option value="VI">Virgin Islands, U.S.</option><option value="WF">Wallis and Futuna</option><option value="EH">Western Sahara</option><option value="YE">Yemen</option><option value="ZM">Zambia</option><option value="ZW">Zimbabwe</option></select>';

    var apikey_error = $('input[id$="/mycustom/customendpoint/setupentity/apikey_id"]').next('.widgeterror');
    apikey_error.on('show', function(eve) {
      eve.target.innerHTML = "API keys do not match";
    });

    // validation for first name
    var fname = $('input[id$="/mycustom/customendpoint/setupentity/user_firstname_id"]');
    validateInput(fname, /^[A-Za-z ]+$/, "Please enter a first name. No numbers or special characters are permitted.");
    // validation for last name
    var lname = $('input[id$="/mycustom/customendpoint/setupentity/user_lastname_id"]');
    validateInput(lname, /^[A-Za-z ]+$/, "Please enter a last name. No numbers or special characters are permitted.");
    // validation for email
    var user_email = $('input[id$="/mycustom/customendpoint/setupentity/user_email_id"]');
    validateInput(user_email, /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Please enter a valid email address.");
    // validation for phone number
    var user_phone = $('input[id$="/mycustom/customendpoint/setupentity/user_phone_id"]');
    validateInput(user_phone, /^([a-zA-Z,#/ \.\(\)\-\+\*]*[0-9]){7}[0-9a-zA-Z,#/ \.\(\)\-\+\*]*$/, "Please enter a valid phone number. Phone numbers may contain numbers and hyphen characters.");
   // validation for password
   var user_password = $('input[id$="/mycustom/customendpoint/setupentity/user_password_id"]');
    validateInput(user_password, /^(?=.*[a-z].*[a-z])(?=.*[A-Z].*[A-Z])(?=.*\d.*\d)(?=.*[!@#$%^&*-].*[!@#$%^&*-])[A-Za-z\d!@#$%^&*-]{8,}/, "Password must be minimum 8 characters long and contain atleast 2 lowercase, 2 uppercase, 2 numbers and 2 special characters.");
    
    // EULA checkbox
    var eula_ack = $('input[id$="/mycustom/customendpoint/setupentity/eula_ack_id"]');
    var saveBtn = $('.jmFormActions > button[accesskey$="s"]');
    eula_ack.attr('checked', true);
    eula_ack.change(function() {
      var ischecked = $(this).is(":checked");
      if(!ischecked) {
        saveBtn.attr('disabled', true);
      } else {
        saveBtn.attr('disabled', false);
      }
    });
    
    // enable/disable proxy
    var proxy_enable = $('input[id$="/mycustom/customendpoint/setupentity/proxy_enabled_id"]');
    var check_proxy = proxy_enable.is(":checked");
    enableDisableProxy(check_proxy);
    proxy_enable.change(function() {
      var ischecked = $(this).is(":checked");
      enableDisableProxy(ischecked);
    });

    function enableDisableProxy(enable) {
      var proxy_host = $('div[id$="item-/mycustom/customendpoint/setupentity/proxy_host"]');
      var proxy_port = $('div[id$="item-/mycustom/customendpoint/setupentity/proxy_port"]');
      var proxy_username = $('div[id$="item-/mycustom/customendpoint/setupentity/proxy_username"]');
      var proxy_password = $('div[id$="item-/mycustom/customendpoint/setupentity/proxy_password"]');
      proxy_host.toggle(!!enable);
      proxy_port.toggle(!!enable);
      proxy_username.toggle(!!enable);
      proxy_password.toggle(!!enable);
      if(!enable) {
        proxy_password.find('.widgeterror').hide();
        proxy_host.find('input[id$="/mycustom/customendpoint/setupentity/proxy_host_id"]').val('');
        proxy_port.find('input[id$="/mycustom/customendpoint/setupentity/proxy_port_id"]').val('');
        proxy_username.find('input[id$="/mycustom/customendpoint/setupentity/proxy_username_id"]').val('');
        proxy_password.find('input[id$="/mycustom/customendpoint/setupentity/proxy_password_id"]').val('');
        proxy_password.find('input[id$="/mycustom/customendpoint/setupentity/proxy_password_id_confirm"]').val('');
      }
    }
    
    function validateInput(inputId, regEx, errMsg) {
      inputId.on('input', function() {
        var err = $(this).next('.widgeterror');
        if(this.value.length > 0) {
          if(regEx.test(this.value)) {
            err.hide();
          } else {
            err[0].innerHTML = errMsg;
            err.show();
          }
        } else err.hide();
      });
    }

}
