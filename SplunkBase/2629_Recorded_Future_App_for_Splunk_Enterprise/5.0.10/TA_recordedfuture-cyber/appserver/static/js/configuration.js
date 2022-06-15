$(document).ready(function () {
    const xhr = new XMLHttpRequest();
    const configUrl = '/en-US/splunkd/__raw/services/TA_recordedfuture-cyber/configuration';

    let csrfToken = '';
    let cookieArr = document.cookie.split(";");

    csrfToken = getCrfsToken(cookieArr);
    // console.log('TOKEN set: ', csrfToken);

    function getCrfsToken(arr) {
        let csrf_cookies = [];
        let token_key = undefined;
        arr.forEach(function (cookieCandidate) {
            if (cookieCandidate.includes('token_key')) {
                token_key = cookieCandidate.split('=').pop();
            } else if (cookieCandidate.includes('splunkweb_csrf_token')) {
                csrf_cookies.push(cookieCandidate.split('=').pop());
            }
        });
        // console.log('token_key: ', token_key);
        // console.log('csrf_cookies: ', csrf_cookies);

        // Check if have a token_key.
        if (token_key !== undefined) {
            console.log('Cookie token_key found, using that.');
            return token_key;
        }

        // Only one CSRF cookie, use it.
        if (csrf_cookies.length === 1) {
            console.log('Single CSRF token found, using that.');
            return csrf_cookies[0];
        }

        // Multiple CSRF cookies found, loop until a valid one is found.
        csrf_cookies.forEach(function (csrfCookie) {
            // Test if the CSRF token works.
            // console.log('Testing ', csrfCookie);
            if (doCookieTestRequest(csrfCookie)) {
                // console.log('Valid CSRF cookie found.');
                csrf_token = csrfCookie;
            }
        });
        if (csrf_token === undefined) {
            console.log('No valid CSRF cookie found.');
        } else {
            console.log('Working CSRF cookie found in set, using that.');
            return csrf_token;
        }
    }

    function doCookieTestRequest(csrfToken) {
        const xhrtest = new XMLHttpRequest();
        xhrtest.open('POST', configUrl, false);
        xhrtest.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhrtest.setRequestHeader('Content-Type', 'application/json');
        xhrtest.setRequestHeader('X-Splunk-Form-Key', csrfToken);
        xhrtest.onreadystatechange = function () {
            // console.log('Entering onreadystatechange... ', xhrtest.readyState);
            if (xhrtest.readyState === 4) {   //if complete
                // console.log('   readyState = 4');
                if (xhrtest.status === 200) {  //check if "OK" (200)
                    // console.log('   status = 200');
                    result = true;
                    return result;
                } else {
                    // console.log('   status =', xhrtest.status);
                    result = false; //otherwise, some other code was returned
                    return result;
                }
            }
        }
        // console.log('doing the send...');
        xhrtest.send();
        // console.log('... send done.');
        // console.log('   result = ', result);
        return result;
    }

    getSplunkConfiguration();
    addListeners();

    function addListeners() {
        const navSetup = document.getElementById('nav-setup');
        const navRisk = document.getElementById('nav-risk');
        const navAlert = document.getElementById('nav-alert');
        const setupView = document.getElementById('setup-view');
        const riskView = document.getElementById('risk-view');
        const alertView = document.getElementById('alert-view');

        navigationListener(navSetup, navRisk, navAlert, setupView, riskView, alertView);

        // Disable save button if form is pristine and hide feedback banner
        $('.rf-save-btn').prop('disabled', true);
        $('.feedback-dialog').addClass('transparent');
        $('.material-green').addClass('transparent');


        $('#form').submit(function (e) {

            // get ssl toggle and convert to number string
            switch ($('#ssl-toggle').prop('checked')) {
                case true:
                    $('#ssl-toggle').val('1');
                    break;
                case false:
                    $('#ssl-toggle').val('0');
                    break;
            }


            // get proxy  toggle and convert to number string
            switch ($('#rf-accordion-proxy').prop('checked')) {
                case true:
                    $('#rf-accordion-proxy').val('1');
                    break;
                case false:
                    $('#rf-accordion-proxy').val('0');
                    break;
            }

            const proxyHost = $('#proxy-host').val();
            const proxyPort = $('#proxy-port').val();
            const proxyUsername = $('#proxy-username').val();
            const proxyPassword = $('#proxy-password').val();
            const proxyEnabled = $('#rf-accordion-proxy').val();

            const sslEnabled = $('#ssl-toggle').val();

            const apiToken = $('#api-token').val();
            const apiUrl = $('#api-url-input').val();

            /* Iterate and push all risk and alert entities whitout delete-flag*/
            const riskListArray = [];
            const alertListArray = [];
            /* Iterate and push all risk entities whitout delete-flag*/
            const riskFields = $('.risk-entity ');
            riskFields.each(function (index) {
                // parse and send right true/false format for splunk
                const deleteRisk = $('#delete-checkbox' + index).is(':checked');
                if (deleteRisk === false) {
                    const riskToggle = $('#risk-toggle-' + index).is(':checked');
                    let enabled = '';
                    (riskToggle) ? enabled = '1' : enabled = '0';
                    const riskList = {
                        interval: $('#risk-interval-' + index).prop('value'),
                        category: $('#risk-category-' + index).prop('placeholder'),
                        name: $('#risk-name-' + index).val(),
                        fusion_file: $('.risk-fusionfile' + index).val(),
                        enabled: enabled
                    };
                    riskListArray.push(riskList);
                }
            });

            const alertFields = $('.alert-entity');
            alertFields.each(function (index) {
                const deleteAlert = $('#delete-alert-checkbox' + index).is(':checked');
                const alertToggle = $('#alert-toggle-' + index).is(':checked');
                let alertEnabled = '';
                if (alertToggle === false) {
                    alertEnabled = '0';
                } else {
                    alertEnabled = '1';
                }
                if (deleteAlert === false) {
                    const alertList = {
                        alert_rule_id: $('#alert-id-' + index).val(),
                        alert_rule_name: $('.alert-rule-name' + index).prop('id'),
                        name: $('#alert-name' + index).val(),
                        alert_status: $('#alert-status' + index).val(),
                        limit: $('#alert-limit' + index).val(),
                        triggered: $('#alert-triggered' + index).val(),
                        enabled: alertEnabled
                    };
                    alertListArray.push(alertList);
                }
            });

            /*Only push if user has created a new risk and/or alert */
            const newRiskRule = $('#new-rule-container').hasClass('active');
            if (newRiskRule) {
                const newRuleObj = {
                    interval: $('#new-risk-interval').val(),
                    category: $('#new-risk-category').val(),
                    name: $('#new-list-name').val(),
                    fusion_file: $('#new-fusion-file').val(),
                    enabled: '1'
                };

                // check so we dont send empty fields
                if (newRuleObj.name !== undefined && newRuleObj.fusion_file !== undefined) {
                    riskListArray.push(newRuleObj);
                }

            }

            const newAlert = $('#new-alert-container').hasClass('active');
            if (newAlert) {
                const newAlertObj = {
                    alert_rule_id: $('#new-alert-id').val(),
                    alert_rule_name: $('#new-meta-name').val(),
                    name: $('#new-alert-name').val(),
                    alert_status: $('#new-alert-status').val(),
                    limit: $('#new-alert-limit').val(),
                    triggered: $('#new-alert-time-range').val(),
                    enabled: '1'
                };

                if (newAlertObj.name !== undefined || newAlertObj.name !== '') {
                    alertListArray.push(newAlertObj);
                }
            }


            const logArray = $('.radio-input:checked');
            const logLevel = logArray[0].value;

            const json = {
                entry: [
                    {
                        content: {
                            api_url: apiUrl,
                            api_token: apiToken,
                            ssl_verify: sslEnabled,
                            logging: logLevel,
                            proxy: {
                                proxy_enabled: proxyEnabled,
                                proxy_username: proxyUsername,
                                proxy_password: proxyPassword,
                                proxy_rdns: '0',
                                proxy_port: proxyPort,
                                proxy_url: proxyHost
                            },
                            alerts: alertListArray,
                            risklists: riskListArray
                        },
                        name: 'configuration'
                    }
                ],
                links: {}
            };

            // remove active flag so we have a fresh state
            if ($('#new-alert-container').hasClass('active')) {
                $('#new-alert-container').removeClass('active');
            }
            postConfiguration(json);
            e.preventDefault();
        });


        // Check if form is touched, if true show dialog and enable save
        $('form').on('keyup change paste click', 'input[type=text],input[type=password], select, textarea, .radio-btn-group,' +
            ' .delete-section, #edit-api-url, .edit-list-title, .edit-risk-interval, .fusion-row, .edit-time-range li', function () {
            $('.rf-save-btn').prop('disabled', false);
            $('#feedback-text').text('Some changes are not yet saved');
            $('.feedback-dialog').removeClass('transparent');
        });


        const proxyAccordion = document.getElementById('rf-accordion-proxy');
        const proxyDropDown = $('#proxy-settings-dropdown');
        /* Expand proxy section if toggled*/
        if (proxyAccordion) {
            proxyAccordion.addEventListener('click', function () {

                (proxyDropDown.hasClass('hidden')) ? proxyDropDown.removeClass('hidden') : proxyDropDown.addClass('hidden');

            });

        }


        /* helper functions to hide tabs content if not clicked*/
        function hideElem(el) {
            el.classList.add('hidden');
        }

        function showElem(el) {
            el.classList.remove('hidden');
        }

        function setElemActive(el) {
            el.classList.add('active-li');
        }

        function removeElemActive(el) {
            el.classList.remove('active-li');
        }

        // Handles which view to show
        function navigationListener(navSetup, navRisk, navAlert, setupView, riskView, alertView) {
            hideElem(riskView);
            hideElem(alertView);
            showElem(setupView);
            setElemActive(navSetup);

            navSetup.addEventListener('click', function () {
                removeElemActive(navRisk);
                removeElemActive(navAlert);
                setElemActive(navSetup);

                hideElem(riskView);
                hideElem(alertView);
                showElem(setupView);
            });

            navRisk.addEventListener('click', function () {
                removeElemActive(navSetup);
                removeElemActive(navAlert);
                setElemActive(navRisk);

                hideElem(setupView);
                hideElem(alertView);
                showElem(riskView);
            });

            navAlert.addEventListener('click', function () {
                removeElemActive(navSetup);
                removeElemActive(navRisk);
                setElemActive(navAlert);

                hideElem(riskView);
                hideElem(setupView);
                showElem(alertView);
            });
        }
    }

    function postToggleUpdate(list, enabled) {

        const jsonData = {
            entry: [
                {
                    content: {
                        toggle_name: list.name,
                        enabled: enabled,
                        type: list.category
                    },
                    name: 'configuration'
                }
            ],
            links: {}
        };

        xhr.open('POST', configUrl, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Splunk-Form-Key', csrfToken);
        xhr.send(JSON.stringify(jsonData));
        xhr.onload = function () {
            if (xhr.status !== 200) {
                $('.feedback-dialog').removeClass('transparent');
                $('#feedback-text').text('Something went wrong');
            } else {
                const data = JSON.parse(xhr.responseText);
                console.log('response ', data);
            }
        }
    }

    function postConfiguration(json) {
        xhr.open('POST', configUrl, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Splunk-Form-Key', csrfToken);
        xhr.send(JSON.stringify(json));
        xhr.onreadystatechange = function () {
            if (this.status !== 200) {
                console.log('error ', xhr.status);
                $('.feedback-dialog').removeClass('transparent');
                $('#feedback-text').text('Something went wrong');
            } else {
                const data = JSON.parse(xhr.responseText);
                if (data.entry[0].content.error === false) {
                    $('.feedback-dialog').removeClass('transparent');
                    $('#feedback-text').text('All changes are saved');
                    $('.material-green').removeClass('transparent');
                    location.reload(true);
                } else {
                    $('#feedback-text').text('Failed to save');
                }
            }
        };
    }

// Enable editing
      $('#edit-api-url').click(function () {
        $('#api-url-input').removeAttr('disabled');
        $('#edit-api-url').addClass('hidden');
        var ApiUrl = $('#api-url-input')[0];
        ApiUrl.oninput = function() { ApiUrl.setCustomValidity(""); }
        ApiUrl.oninvalid = function() { ApiUrl.setCustomValidity('The API URL has to start with https://.'); }
    });

    /* Http GET /configuration json from splunk*/
    function getSplunkConfiguration() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', configUrl, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Splunk-Form-Key', csrfToken);
        xhr.send("output_mode=json");
        xhr.onload = function () {
            if (xhr.status !== 200) {
                //Show error in feedback banner
                $('.feedback-dialog').removeClass('transparent');
                const feedback = $('.feedback-dialog');
                const error = $('<span>Error from server</span>');
                feedback.append(error);
            } else if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);

                /*Populate Setup section with data from config endpoint*/
                const configData = data.entry[0].content;
                const proxyData = configData.proxy;

                $('#api-url-input').val(configData.api_url);
                // $('#api-token').val('api_token');
                $('#proxy-password').val('proxy_password');

                const sslToggle = $('#ssl-toggle');

                if (configData.ssl_verify === '0') {
                    sslToggle.prop('checked', false);
                    sslToggle.parent('.ssl-checkbox').removeClass('checked');
                } else if (configData.ssl_verify === '1') {
                    sslToggle.prop('checked', true);
                    sslToggle.parent('.ssl-checkbox').addClass('checked');
                }

                setProxyData(proxyData);

                // Set Log level
                const loggingRadioBtn = configData.logging.toLowerCase();
                $('#' + loggingRadioBtn).prop('checked', true);

                const riskList = configData.risklists;
                const alertList = configData.alerts;
                getRiskList(riskList);
                getAlertList(alertList);
            }
        }
    }

    // Set proxy data
    function setProxyData(proxy) {
        const proxyToggle = $('#rf-accordion-proxy');

        if (proxy.proxy_enabled === '0') {
            proxyToggle.prop('checked', false);
            proxyToggle.parent('.proxy-checkbox').removeClass('checked');
            $('#proxy-settings-dropdown').addClass('hidden');
        } else if (proxy.proxy_enabled === '1') {
            proxyToggle.prop('checked', true);
            proxyToggle.parent('.proxy-checkbox').addClass('checked');
            $('#proxy-settings-dropdown').removeClass('hidden');
        }

        $('#proxy-host').val(proxy.proxy_url);
        $('#proxy-port').val(proxy.proxy_port);
        $('#proxy-username').val(proxy.proxy_username);
    }


    $('.proxy-checkbox').click(function () {
        let enabled = '';
        const proxyToggle = $('#rf-accordion-proxy').is(':checked');

        (proxyToggle) ? enabled = '1' : enabled = '0';
        const list = {
            name: 'proxy_enabled',
            category: 'proxy_enabled'
        };
        postToggleUpdate(list, enabled);
    });

    $('.ssl-checkbox').click(function () {
        let enabled = '';
        const sslToggle = $('#ssl-toggle').is(':checked');
        (sslToggle) ? enabled = '1' : enabled = '0';
        const list = {
            name: 'ssl_verify',
            category: 'ssl_verify'
        };

        postToggleUpdate(list, enabled);
    });

  /* Render section for new alert */
  const newAlertForm = function (index, meta) {
    //hide previos drop down with meta data list
    $('#metadata-list').addClass('hidden');
    //Render form for new alerting rule
    const subscriptionForm = $('<div class="col-12 render-alert-rule border-bottom" id="render-subscribe-container"><table class="table table-borderless"><tbody>' +
      '<tr>' +
      '<td colspan="6" class="list-title"><input id="new-alert-name" type="text" style="width: 500px;" placeholder="Alert Rule Name*" pattern="[A-Za-z0-9-_]+" oninput="setCustomValidity(\'\')" oninvalid="setCustomValidity(\'Only alphanumeric characters, dash and underscore are allowed.\')" required></td>' +
      '</tr>' +
      '<tr>' +
      '<td colspan="4">Alert Status</td>' +
      '<td style="padding-left: 196px;"><select id="new-alert-status" type="text" required>' +
      '<option value="any" selected>Any</option>' +
      '<option value="unassigned">Unassigned</option>' +
      '<option value="assigned">Assigned</option>' +
      '<option value="actionable">Actionable</option>' +
      '<option value="no-action">No Action</option>' +
      '<option value="tuning">Tuning</option>' +
      '</select></td>' +
      '</tr>' +
      '<tr>' +
      '<td colspan="4" class="rf-link">Time Range</td>' +
      '<td style="padding-left: 196px;"><input class="new-time-range" id="new-alert-time-range" type="text" placeholder="Example: -7d to now" value="anytime" ></td>' +
      '</tr>' +
      '<tr>'+
      '<td colspan="4"></td>'+
      '<td colspan="2" style="padding-top:0;padding-right: 0;">' +
      '<div style="padding-left:160px;">' +
      '<ul class="time-range">'+
      '<li class="rf-link new-time-range" id="-1h to now" > Last hour </li>' +
      '<li class="rf-link new-time-range" id="-1d to now"> Last 24 hours </li>' +
      '<li class="rf-link new-time-range" id="-7d to now"> Last 7 days </li>' +
      '<li class="rf-link new-time-range" id="anytime"> Any Time </li>'+
      '</ul>'+
      '</div>'+
      '</td>' +
      '</tr>' +
      '<tr>' +
      '<td colspan="4" >Limit</td>' +
      '<td  style="padding-left: 196px;"><input id="new-alert-limit" value="10"></td>' +
      '</tr>' +
      '<tr>' +
      '<td colspan="4" >Alerting Rule</td>' +
      '<td><input class="rf-input disabled" id="new-meta-name" value="' + meta.name + '" style="width: 95%;" disabled></td>' +
      '</tr>' +
      '<tr><td colspan="6"><span class="rf-link" id="discard-alert" style="float:right;">Discard Alert Draft</span></td></tr>' +
      '</tbody></table><input class="hidden" id="new-alert-id" value="' + meta.id + '"></div>');

    $('#new-alert-container').append(subscriptionForm);

    $('li').on('click', function (select) {
      console.log('click; ', select, index);
      $('.new-time-range').val(select.target.id);
    });

    //event listener for "Discard Alert Draft"
    $('#discard-alert').on('click', function () {
      $('#new-alert-container').removeClass('active');
      $('.render-alert-rule').removeClass('border-bottom');
      $('#render-subscribe-container').empty();
    })
  };

  /* Fetch meta data and show in list dropdown*/
  const createNewAlert = function () {
    //hide link "Add Alerting Rule"
    $('#subscribe-alerts').addClass('hidden');
    $('.alert-dialog').removeClass('hidden');

    const url = '/en-US/splunkd/__raw/services/TA_recordedfuture-cyber/alerts_metadata';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Splunk-Form-Key', csrfToken);
    xhr.send("output_mode=json");
    xhr.onload = function () {
      if (xhr.status !== 200) {
        console.log('error ', xhr.status);
        $('.feedback-dialog').removeClass('transparent');
        $('#feedback-text').text("Error: Can't get rule list");
      } else {
        const res = JSON.parse(xhr.responseText);
        const metaData = res.entry;

        //create "all alerts" category and push to meta data list
        const obj = {
          id: 'any',
          name: 'All Alerts'
        };

        metaData.unshift(obj);

        $('#metadata-list').removeClass('hidden');

        $.each(metaData, function (index, meta) {
          $('#metadata-list').append(('<li id="alert-' + index + '">' + meta.name + '</li>'));

          // Click event for chosen metadata
          $("#alert-" + index).click(function () {
            $('.render-alert-rule').remove();
            newAlertForm(index, meta);
          })
        });
      }
    };
  };

  // Listener for add alert list link
  $('#subscribe-alerts-link').click(function () {
    const addAlertClicked = $('#new-alert-container');
    addAlertClicked.addClass('active');
    createNewAlert();
  });

  /* Iterate risk list and populate */
  function getRiskList(riskList) {
    $.each(riskList, function (index, risk) {
      renderRiskList(index, risk);
      const riskToggle = $('#risk-toggle-' + index);
      if (risk.enabled === '0') {
        riskToggle.prop('checked', false);
        riskToggle.parent('.risk-checkbox').removeClass('checked');
      } else if (risk.enabled === '1') {
        riskToggle.prop('checked', true);
        riskToggle.parent('.risk-checkbox').addClass('checked');
      }
    });
  }

  /* Populate and render Risk List*/
  function renderRiskList(index, risk) {
    const listEntity = $('<div class="risk-entity border-bottom" id="risk-entity' + index + '" style="padding-left: 0; padding-right: 0;"><table class="table table-borderless">' +
      '<thead>' +
      '<th><input class="edit-list-title list-title risk-title' + index + '" id="risk-name-' + index + '" value="' + risk.name + '" style="font-size: 13px;font-weight: 500;" pattern="[A-Za-z0-9-_]+" oninput="setCustomValidity(\'\')" oninvalid="setCustomValidity(\'Only alphanumeric characters, dash and underscore are allowed.\')" required/></th>' +
      '<th class="entity-type-label">' +
      '<input class="rf-input risk-category' + index + '" id="risk-category-' + index + '" placeholder="' + risk.category + '" />' +
      '<th class="options">' +
      '<div class="rf-switch" style="float: right; margin-bottom: 5px;">' +
      '<label class="rf-switch__switch"">' +
      '<input class="rf-switch__checkbox risk-checkbox"  id="risk-toggle-' + index + '" type="checkbox">' +
      '<div class="rf-switch__slider"></div></label></div></div>' +
      '</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody class="entity-type-label">' +
      '<tr>' +
      '<td>Update Interval</td>' +
      '<td>' +
      '<select class="edit-risk-interval risk-intervals' + index + '" id="risk-interval-' + index + '" name="options' + index + '" disabled>' +
      '<option value="300">Default</option>' +
      '<option value="3600">Once an Hour</option>' +
      '<option value="7200">Once every two Hours</option>' +
      '<option value="43200">Twice per day</option>' +
      '<option value="86400">Once per day</option>' +
      '</select></td>' +
      '<td class="options rf-link edit-risk" id="edit-risk-rule' + index + '"><span class=" edit-link">Edit</span></td>' +
      '</tr>' +
      '<tr class="fusion-row' + index + ' hidden">' +
      '<td>Fusion File</td>' +
      '<td><input class="risk-fusionfile' + index + '" type="text" value="' + risk.fusion_file + '" pattern="[A-Za-z0-9-_\/\.]+" oninput="setCustomValidity(\'\')" oninvalid="setCustomValidity(\'Only alphanumeric characters, dash, underscore, period and slash are allowed.\')" required>' +
      '</td>' +
      '</tr>' +
      '<tr class="delete-section" id="delete-risk' + index + '">' +
      '<td>Delete Risk List</td>' +
      '<td style="display: flex; justify-content: space-around; padding-left: 0;">' +
      '<input class="align-delete-checkbox" id="delete-checkbox' + index + '" type="checkbox" style="max-width: 14px;"/>' +
      '</td>' +
      '</tr>' +
      '</tbody>' +
      '</table></div>');

    $('.risk-list').append(listEntity);

    $('.risk-title' + index).prop('disabled', true).addClass('rf-input');

    // Set right value to selectbox
    $('select[name="options' + index + '"]').find('option[value="' + risk.interval + '"]').prop("selected", true);
    $('select[name="options' + index + '"]').prop('disabled', true);

    $(' risk-category' + index).prop('disabled', true);
    $('.risk-interval-edit' + index).addClass('hidden');

    // Dont render delete option for default lists
    const listName = risk.name;
    $('#delete-risk' + index).addClass('hidden');
    if (listName === 'rf_domain_risklist' || listName === 'rf_hash_risklist' || listName === 'rf_ip_risklist' || listName === 'rf_url_risklist' || listName === 'rf_vulnerability_risklist') {
    } else {
      $('#delete-risk' + index).removeClass('hidden');
    }

    // Handle risk toggle and Convert splunk "1" & "0" to true/false
    const riskToggle = $('#risk-toggle-' + index);
    riskToggle.on('click', function () {
      const toggleState = $('#risk-toggle-' + index).is(':checked');
      (toggleState) ? risk.enabled = '1' : risk.enabled = '0';
      postToggleUpdate(risk, risk.enabled);
    });

    // Enable fields on edit
    $('#edit-risk-rule' + index).click(function () {
      if (risk.name !== 'rf_' + risk.category + '_risklist') {
        $('.risk-title' + index).prop('disabled', false).removeClass('rf-input');
        $('risk-intervals' + index).prop('disabled', false);
        $('.fusion-row' + index).removeClass('hidden');
      }
      // if default lists only allow to edit update interval
      $('#risk-interval-' + index).prop('disabled', false);
      $('#edit-risk-rule' + index).addClass('hidden');
      $('.risk-interval-edit' + index).removeClass('hidden');
      $('.interval' + index).addClass('hidden');
    });
  }

  /* Render UI for adding a new alerting rule*/
  const newRisk = $('<div class="bottom-border new-risk-rule">' +
    '<table class="table table-borderless"><thead>' +
    '<th colspan="5"><input id="new-list-name" type="text"  placeholder="Type Risk List Name*" style="width: 460px;" pattern="[A-Za-z0-9-_]+" oninput="setCustomValidity(\'\')" oninvalid="setCustomValidity(\'Only alphanumeric characters, dash and underscore are allowed.\')" required/></th>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td class="wide-input">Select Type </td>' +
    '<td >' +
    '<select  class="wide-input risk-categories" id="new-risk-category" >' +
    '<option id="category-domain" value="domain">Domain</option>' +
    '<option id="category-vulnerability" value="vulnerability">Vulnerability</option>' +
    '<option id="category-hash" value="hash">Hash</option>' +
    '<option id="category-url" value="url">URL</option>' +
    '<option id="category-ip" value="ip">IP</option>' +
    '</select>' +
    '</td></tr>' +
    '<tr><td>Fusion File*</td>' +
    '<td class="wide-input" ><input class="wide-input" id="new-fusion-file" type="text" placeholder="Add file path" pattern="[A-Za-z0-9-_\/\.]+" oninput="setCustomValidity(\'\')" oninvalid="setCustomValidity(\'Only alphanumeric characters, dash, underscore, period and slash are allowed.\')" required/></td></tr>' +
    '<tr><td>Update Interval </td><td class="wide-input" colspan="4">' +
    '<select  class="wide-input" id="new-risk-interval">' +
    '<option id="default" value="300">Default</option>' +
    '<option id="hour" value="3600">Once an Hour</option>' +
    '<option id="two-hours" value="7200">Once every two Hours</option>' +
    '<option id="day" value="86400">Once per day</option>' +
    '<option id="two-days" value="43200">Twice per day</option>' +
    '</select>' +
    '</td></tr>' +
    '<tr><td colspan="2"><span class="rf-link discard" id="discard-risk">Discard Risk List</span></td></tr>' +
    '</tbody>' +
    '</table>' +
    '</div>');

  $('#add-risk').click(function () {
    $('#add-risk').addClass('hidden');
    newRisk.removeClass('hidden');
    $('#new-rule-container').append(newRisk).addClass('active');
    // Empty and hide section of user pressed "Dicard alerting rule"
    $('#discard-risk').on('click', function () {
      // empty all fields
      $('#new-list-name').val('');
      $('#new-fusion-file').val('');
      //remove class active so no data is sent to config
      $('#new-rule-container').removeClass('active');
      // hide section for new risk list
      newRisk.addClass('hidden');
      $('#add-risk').removeClass('hidden');
    });
  });

  /* Iterate alerts list populate and render UI */
  function getAlertList(alertList) {
    if (alertList.length >= 0) {
      $.each(alertList, function (index, alert) {
        renderAlertList(index, alert);

        // Handle alert toggle and Convert splunk "1" & "0" to true/false
        const alertToggle = $('#alert-toggle-' + index);
        if (alert.enabled === '0') {
          alertToggle.prop('checked', false);
          alertToggle.parent('.alert-checkbox').removeClass('checked');
        } else if (alert.enabled === '1') {
          alertToggle.prop('checked', true);
          alertToggle.parent('.alert-checkbox').addClass('checked');
        }
      });
    }
  }

  /* Render and populate UI for Alerting Rules */
  function renderAlertList(index, alert) {
    // Show " Add Alerting Rule" link
    $('#subscribe-alerts-link').removeClass('hidden');

    const alertEntity = $('<div class="alert-entity border-bottom" id="alert-entity"><table class="table table-borderless">' +
      '<thead>' +
      '<th class="list-title" style="padding-left: 0; margin-bottom:10px; vertical-align: inherit;"><input class="alert-name' + index + '" id="alert-name' + index + '" value="' + alert.name + '" type="text" style="font-weight: 500; padding-left: 11px; margin-bottom: 0;" pattern="[A-Za-z0-9-_]+" oninput="setCustomValidity(\'\')" oninvalid="setCustomValidity(\'Only alphanumeric characters, dash and underscore are allowed.\')" required></th>' +
      '<th class="options">' +
      '<div class="rf-switch" style="float: right; margin-bottom: 5px; padding-left: 0;">' +
      '<label class="rf-switch__switch"">' +
      '<input class="rf-switch__checkbox alert-checkbox"  id="alert-toggle-' + index + '" type="checkbox">' +
      '<div class="rf-switch__slider"></div></label></div></div>' +
      '</th>' +
      '<th class="options rf-link edit-link" id="edit-alert' + index + '">Edit</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody class="entity-type-label">' +
      '<tr>' +
      '<td>Alert Status</td>' +
      '<td  style="padding-right:0;">' +
      '<select class="alert-status-edit' + index + '" id="alert-status' + index + '"  name="alertstatus' + index + '" style="width: 100%;">' +
      '<option value="any">Any</option>' +
      '<option value="unassigned">Unassigned</option>' +
      '<option value="assigned">Assigned</option>' +
      '<option value="actionable">Actionable</option>' +
      '<option value="no-action">No Action</option>' +
      '<option value="tuning">Tuning</option>' +
      '</select>' +
      '</td>' +
      '</tr>' +
      '<tr>' +
      '<td>Time Range</td>' +
      '<td><input class="time-range-field alert-time-range' + index + '" id="alert-triggered' + index + '" value="' + alert.triggered + '" type="text" style="width: 100%; margin-bottom: 0; padding-left: 0;"></td>' +
      '</tr>' +
      '<tr class="edit-time-range' + index + '" id=""><td colspan="2" style="padding-top:0;padding-right: 0;">' +
      '<div style="margin-left:218px;">' +
      '<ul class="time-range"><li class="rf-link time-range' + index + '" id="-1h to now" > Last hour </li>' +
      '<li class="rf-link time-range' + index + '" id="-1d to now"> Last 24 hours </li>' +
      '<li class="rf-link time-range' + index + '" id="-7d to now"> Last 7 days </li>' +
      '<li class="rf-link time-range' + index + '" id="anytime"> Any Time </li></div></ul></td>' +
      '</tr>' +
      '<tr>' +
      '<td >Limit</td>' +
      '<td  style="padding-right:0;"><input class="alert-limit' + index + '" id="alert-limit' + index + '" value="' + alert.limit + '" type="text" style="width: 100%; margin-bottom: 0; padding-left: 0;"></td>' +
      '</tr>' +
      '<tr>' +
      '<td>Alerting Rule</td>' +
      '<td><input class="rf-input alert-rule-name' + index + '" id="' + alert.alert_rule_name + '" value="' + alert.alert_rule_name + '" style="" disabled></td>' +
      '</tr>' +
      '<tr class="delete-section" id="delete-alert' + index + '">' +
      '<td>Delete Alerting Rule</td>' +
      '<td style="display: flex; justify-content: space-around; padding-left: 0;">' +
      '<input  class="align-delete-checkbox" id="delete-alert-checkbox' + index + '" type="checkbox" style="max-width: 14px;"/>' +
      '</div>' +
      '</tr>' +
      '</tbody>' +
      '</table>' +
      '</div>' +
      '<input class="hidden" id="alert-id-' + index + '" value="' + alert.alert_rule_id + '">'
    );

    $('.alert-list').append(alertEntity);

    $('input alert-name' + index).addClass('pl-0');

    // Disable fields if not in edit mode
    $('.alert-time-range' + index).prop('disabled', true);
    $('.alert-limit' + index).prop('disabled', true);
    $('.edit-time-range' + index).addClass('hidden');
    $('.alert-name' + index).prop('disabled', true).addClass('rf-input');

    /* unused code?
    $('radio-input-alert').on('change', function () {
      $('radio-input-alert').not(this).prop('checked', false);
    });*/

    // Set right value to selectbox
    $('select[name="alertstatus' + index + '"]').find('option[value="' + alert.alert_status + '"]').prop("selected", true);
    $('select[name="alertstatus' + index + '"]').prop('disabled', true);

    // Handle selectbox changes
    $('.time-range' + index).on('click', function (select) {
      $('.alert-time-range' + index).val(select.target.id);
    });

    // Handle edit - enable fields
    $('#edit-alert' + index).click(function () {
      $('.alert-limit' + index).prop('disabled', false);
      $('#alert-triggered' + index).removeClass('rf-input');
      $('#edit-alert' + index).addClass('transparent');
      $('.edit-time-range' + index).removeClass('hidden');
      $('select[name="alertstatus' + index + '"]').prop('disabled', false);
      $('.alert-time-range' + index).prop('disabled', false);
      $('.alert-name' + index).prop('disabled', false).removeClass('rf-input');
    });

    // Handle toggle event and send to /configuration
    const alertToggle = $('#alert-toggle-' + index);

    alertToggle.on('click', function () {
      const toggleState = $('#alert-toggle-' + index).is(':checked');
      (toggleState) ? alert.enabled = '1' : alert.enabled = '0';
      const list = {
        name: alert.name,
        category: 'alert'
      };

      postToggleUpdate(list, alert.enabled);
    });
  }
});
