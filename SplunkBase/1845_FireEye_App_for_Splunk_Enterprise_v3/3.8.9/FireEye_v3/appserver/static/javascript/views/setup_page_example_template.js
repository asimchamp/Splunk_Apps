function get_template() {
  const template_string = `

      <div class='title'> 
          <h1>FireEye Setup Page</h1> 
      </div> 

      <div class='setup container'> 
      
      <div>
              <div class='field macro_stanza'> 
                  <div class='title'> 
                      <div> 
                          <h3>Enable your FireEye Product(s)</h3> 
                      </div> 
                  </div> 

                  <div class='user_input'> 
                       <input type='checkbox' id='NX' name='NX'  > </input>
                       <label for='NX' class='label_a'> NX </label>                                 
                  </div> 

                  <div class='user_input'> 
                       <input type='checkbox' id='EX' name='EX'  > </input>
                       <label for='EX' class='label_a'> EX </label>          
                  </div> 

                  <div class='user_input'> 
                       <input type='checkbox' id='AX' name='AX' > </input>
                       <label for='AX' class='label_a'> AX </label>          
                  </div> 

                  <div class='user_input'> 
                       <input type='checkbox' id='FX' name='FX' > </input>
                       <label for='FX' class='label_a'> FX </label>          
                  </div> 

                  <div class='user_input'> 
                       <input type='checkbox' id='HX' name='HX' > </input>
                       <label for='HX' class='label_a'> HX </label>          
                  </div> 

                  <div class='user_input'> 
                       <input type='checkbox' id='PX' name='PX' > </input>
                       <label for='PX' class='label_a'> PX </label>          
                  </div> 

                  <div class='user_input'> 
                       <input type='checkbox' id='TAP' name='TAP' > </input>
                       <label for='TAP' class='label_a'> TAP </label>          
                  </div> 

                  <div class='user_input'> 
                       <input type='checkbox' id='ETP' name='ETP' > </input>
                       <label for='ETP' class='label_a'> ETP </label>          
                  </div> 

                  <div class='user_input'> 
                       <input type='checkbox' id='DOD' name='DOD'  > </input>
                       <label for='DOD' class='label_a'> DOD </label>          
                  </div> 

              </div> 
                  <b>** Reminder: Make sure you restart splunk to see the dashboard changes take effect. Go to Settings -> Server controls -> Restart Splunk **
                  </b>
                  <br/> 
              <div class='field vt_api_key'> 
                  <div > 
                      <h3>VirusTotal Configuration</h3> 
                  </div> 
                  <div class='label_b'> 
                      <label class='label_c' for='vt_api_key'> VirusTotal API Key </label>
                          <input class='input_width password' type='text' name='vt_api_key' id='vt_api_key' placeholder='abc123def456ghi789' ></input> 

                  </div> 
              </div> 

              <div class='field dod_api_key'> 
                  <div > 
                      <h3>DOD Configuration</h3> 
                  </div> 
                  <div class='label_b'> 
                        <label  class='label_c' for='dod_api_key'> DOD API Key </label>
                          <input class='input_width password' type='text' name='dod_api_key' id='dod_api_key' placeholder='abc123def456ghi789' ></input> 
                  </div> 
              </div> 
              <br/> 

              <div class='field macro_definition'> 
                  <div > 
                      <h3>Daily Report Options</h3> 
                      <i>Enable the report, select the schedule, specify the recipient </i>
                  </div> 
                <!-- The field "is_scheduled" maps to the enableSched setting in savedsearches.conf -->
                  <div class='user_input'> 
                          <input type='checkbox' name='daily_report' id='daily_report'  ></input> 
                        <label class='label_a' for='daily_report'>Daily Analytics Report </label>

                  </div> 

                  <div > 
                      <div class='label_b'> 
                        <label class='label_c' for='cron_sched'> Cron schedule (Ex:  "58 23 * * *" means 2 minutes prior to midnight every day) </label>
                          <input class='input_width' type='text' name='cron_sched' id='cron_sched' value='58 23 * * *'></input> 
                      </div> 
                  </div> 

                  <div > 
                      <div class='label_b'> 
                        <label class='label_c' for='email'> Email Address (or distro) </label>
                          <input class='input_width' type='text' name='email' id='email' value='Email@YourOrganization.com'></input> 
                          <br/>

                      </div> 
                  </div> 

              </div> 
                      <i>** Reminder: Configure your mail server setting if you have not already done go to:  Settings -> System Settings -> Email Settings **
                      </i>
              <br/>  
                           
              <div> 
                  <button name='setup_button' class='setup_button'> 
                      Save 
                  </button>

              </div> 
              <br/> 
                <div class='error output' id='err_msg'>  
                </div> 
              
            </div>
      
      </div>`

  return template_string;
}

export default get_template;
