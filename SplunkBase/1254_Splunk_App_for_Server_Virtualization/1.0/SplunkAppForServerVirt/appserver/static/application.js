function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if(results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

switch (Splunk.util.getCurrentView()) {
    
    case "environment":
        
        // jQuery UI functions
        $(document).ready(function() {
            
            $.getScript("/static/app/SplunkAppForServerVirt/jquery-ui.min.js", function() {
                $('#dialog').dialog({
                    autoOpen: false,
                    width: 600,
                    buttons: {
                        Ok: function() {
                            $( this ).dialog( "close" );
                        }
                    }
                });
            });

            $(".hostIcon").click(function() { location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "hosts") });
            $(".vmIcon").click(function() { location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "vms") });
            $(".vmStoreIcon").click(function() { location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "vm_stores") });
            
            $('h2[title="Top 5 Hosts - CPU (combined)"]').css("padding-right","0px");
            $('h2[title="Top 5 Hosts - CPU (combined)"]').css("margin-right","5px");
            $('h2[title="Top 5 Hosts - CPU (combined)"]').after('<a class="tooltip" href="#"><div class="help_icon"></div><span class="custom help"><img src="/static/app/SplunkAppForServerVirt/help.png" alt="Help" height="48" width="48" /><em>Top 5 Hosts - CPU (combined)</em>This chart shows which hosts are utilizing the most CPU cycles as a percentage.  Since each host may have multiple physical CPUs, the combined average of all CPUs in the host is shown.</span></a>');
            
            $('h2[title="Top 5 Hosts - Network (combined)"]').css("padding-right","0px");
            $('h2[title="Top 5 Hosts - Network (combined)"]').css("margin-right","5px");
            $('h2[title="Top 5 Hosts - Network (combined)"]').after('<a class="tooltip" href="#"><div class="help_icon"></div><span class="custom help"><img src="/static/app/SplunkAppForServerVirt/help.png" alt="Help" height="48" width="48" /><em>Top 5 Hosts - Network (combined)</em>This chart shows which hosts are utilizing the most network bandwidth.  Since each host may have multiple physical network interfaces, the combined average of all network interfaces in the host is shown.</span></a>');

        });
            
        
        if (Splunk.Module.NullModule) {
                Splunk.Module.NullModule = $.klass(Splunk.Module.NullModule, {
                    onContextChange: function() {
                        var context = this.getContext();
                        
                        var name = context.get("click.name");
                        var val = context.get("click.value");
                        var name2 = context.get("click.name2");
                        var val2 = context.get("click.value2");
                        
                        var isChart = false;
                        if(context.get("charting.chart") != null) { isChart = true; }
                        
                        if (name == "Hostname") {
                            location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "host") + "?hostname=" + val;
                        }
                        
                        if (name == "VM Name") {
                            location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "vm") + "?vmname=" + val;
                        }
                        
                        if (name == "System Message Details") {
                            $('#dialog').html("<p>"+val+"</p>");
                            $('#dialog').dialog('open');
                        }
                        
                        if (isChart) {
                            location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "host") + "?hostname=" + name2;
                        }
                    },
                });
            }
            
        if(Splunk.Module.SimpleResultsTable) {
            Splunk.Module.SimpleResultsTable = $.klass(Splunk.Module.SimpleResultsTable, {
               onResultsRendered: function($super) {
                
                    // Hide the sourcetype column for "Running VMs"
                    $('#runningVMs').parent().parent().find("tr").find('th:nth-child(2)', this.container).hide();
                    $('#runningVMs').parent().parent().find("tr").find('td:nth-child(2)', this.container).hide();
                    
                    // Hide message body for "System Messages"
                    $('#systemMessages').parent().parent().find("tr").find('th:nth-child(1)', this.container).hide();
                    $('#systemMessages').parent().parent().find("tr").find('td:nth-child(1)', this.container).hide();

                    
                    $('#runningVMs').parent().parent().find("tr:has(td)", this.container).each(function() {
                        var tr = $(this);
                        
                        // Get the hypervisor type (based on sourcetype)
                        var hypervisor_type = tr.find("td:nth-child(2)").text();
                        var hypervisor_hostname = tr.find("td:nth-child(3)");
                        
                        switch(hypervisor_type.toLowerCase())
                        {
                            case "hypervisor:hyperv:vm":
                                hypervisor_hostname.addClass("ico_hyperv");
                                break;
                            
                            case "hypervisor:xenserver:vm":
                                hypervisor_hostname.addClass("ico_xenserver");
                                break;
                        }

                    })
               }
            });
        }

        break;
        
    case "hosts":
        $(document).ready(function() {
            
            $(".numVms").click(function() { location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "vms") });
            $(".numVmsRunning").click(function() { location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "vms") });
            
            $('h2[title="Top 5 Hosts - CPU (combined)"]').css("padding-right","0px");
            $('h2[title="Top 5 Hosts - CPU (combined)"]').css("margin-right","5px");
            $('h2[title="Top 5 Hosts - CPU (combined)"]').after('<a class="tooltip" href="#"><div class="help_icon"></div><span class="custom help"><img src="/static/app/SplunkAppForServerVirt/help.png" alt="Help" height="48" width="48" /><em>Top 5 Hosts - CPU (combined)</em>This chart shows which hosts are utilizing the most CPU cycles as a percentage.  Since each host may have multiple physical CPUs, the combined average of all CPUs in the host is shown.</span></a>');
            
            $('h2[title="Top 5 Hosts - Network (combined)"]').css("padding-right","0px");
            $('h2[title="Top 5 Hosts - Network (combined)"]').css("margin-right","5px");
            $('h2[title="Top 5 Hosts - Network (combined)"]').after('<a class="tooltip" href="#"><div class="help_icon"></div><span class="custom help"><img src="/static/app/SplunkAppForServerVirt/help.png" alt="Help" height="48" width="48" /><em>Top 5 Hosts - Network (combined)</em>This chart shows which hosts are utilizing the most network bandwidth.  Since each host may have multiple physical network interfaces, the combined average of all network interfaces in the host is shown.</span></a>');
            
        });
        
        if (Splunk.Module.NullModule) {
                Splunk.Module.NullModule = $.klass(Splunk.Module.NullModule, {
                    onContextChange: function() {
                        var name = this.getContext().get("click.name");
                        var val = this.getContext().get("click.value");
                        if (name == "Hostname") {
                            location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "host") + "?hostname=" + val;
                        }
                        if (name == "VM Name") {
                            location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "vm") + "?vmname=" + val;
                        }
                    },
                });
            }
            
        if(Splunk.Module.SimpleResultsTable) {
            Splunk.Module.SimpleResultsTable = $.klass(Splunk.Module.SimpleResultsTable, {
               onResultsRendered: function($super) {
                
                    // Hide the sourcetype column for "Running VMs"
                    $('#runningVMs').parent().parent().find("tr").find('th:nth-child(2)', this.container).hide();
                    $('#runningVMs').parent().parent().find("tr").find('td:nth-child(2)', this.container).hide();
                    
                    $('#runningVMs').parent().parent().find("tr:has(td)", this.container).each(function() {
                        var tr = $(this);
                        
                        // Get the hypervisor type (based on sourcetype)
                        var hypervisor_type = tr.find("td:nth-child(2)").text();
                        var hypervisor_hostname = tr.find("td:nth-child(3)");
                        
                        switch(hypervisor_type.toLowerCase())
                        {
                            case "hypervisor:hyperv:vm":
                                hypervisor_hostname.addClass("ico_hyperv");
                                break;
                            
                            case "hypervisor:xenserver:vm":
                                hypervisor_hostname.addClass("ico_xenserver");
                                break;
                        }

                    })
               }
            });
        }
        
        break;
    
    case "vms":
        $(document).ready(function() {
            $(".numHosts").click(function() { location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "hosts") });
            
            $('h2[title="Top 5 Virtual Machines - CPU (combined)"]').css("padding-right","0px");
            $('h2[title="Top 5 Virtual Machines - CPU (combined)"]').css("margin-right","5px");
            $('h2[title="Top 5 Virtual Machines - CPU (combined)"]').after('<a class="tooltip" href="#"><div class="help_icon"></div><span class="custom help"><img src="/static/app/SplunkAppForServerVirt/help.png" alt="Help" height="48" width="48" /><em>Top 5 Virtual Machines - CPU (combined)</em>This chart shows which virtual machines are utilizing the most CPU cycles as a percentage.  Since each virtual machine may have multiple vCPUs, the combined average of all vCPUs in the virtual machine is shown.</span></a>');
            
            $('h2[title="Top 5 Virtual Machines - Network (combined)"]').css("padding-right","0px");
            $('h2[title="Top 5 Virtual Machines - Network (combined)"]').css("margin-right","5px");
            $('h2[title="Top 5 Virtual Machines - Network (combined)"]').after('<a class="tooltip" href="#"><div class="help_icon"></div><span class="custom help"><img src="/static/app/SplunkAppForServerVirt/help.png" alt="Help" height="48" width="48" /><em>Top 5 Virtual Machines - Network (combined)</em>This chart shows which virtual machines are utilizing the most network bandwidth.  Since each virtual machine may have multiple virtual network interfaces, the combined average of all network interfaces in the virtual machine is shown.</span></a>');
            
            $('h2[title="Top 5 Virtual Machines - Disk (combined)"]').css("padding-right","0px");
            $('h2[title="Top 5 Virtual Machines - Disk (combined)"]').css("margin-right","5px");
            $('h2[title="Top 5 Virtual Machines - Disk (combined)"]').after('<a class="tooltip" href="#"><div class="help_icon"></div><span class="custom help"><img src="/static/app/SplunkAppForServerVirt/help.png" alt="Help" height="48" width="48" /><em>Top 5 Virtual Machines - Disk (combined)</em>This chart shows which virtual machines have the highest disk read/writes per second.  Since each virtual machine may have multiple disks, the combined average of all disks in the virtual machine is shown.</span></a>');
        });
        
        if (Splunk.Module.NullModule) {
                Splunk.Module.NullModule = $.klass(Splunk.Module.NullModule, {
                    onContextChange: function() {
                        var name = this.getContext().get("click.name");
                        var val = this.getContext().get("click.value");
                        if (name == "Hostname") {
                            location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "host") + "?hostname=" + val;
                        }
                        if (name == "VM Name") {
                            location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "vm") + "?vmname=" + val;
                        }
                    },
                });
            }
            
        if(Splunk.Module.SimpleResultsTable) {
            Splunk.Module.SimpleResultsTable = $.klass(Splunk.Module.SimpleResultsTable, {
               onResultsRendered: function($super) {
                
                    // Hide the sourcetype column for "Running VMs"
                    $('#runningVMs').parent().parent().find("tr").find('th:nth-child(2)', this.container).hide();
                    $('#runningVMs').parent().parent().find("tr").find('td:nth-child(2)', this.container).hide();
                    
                    $('#runningVMs').parent().parent().find("tr:has(td)", this.container).each(function() {
                        var tr = $(this);
                        
                        // Get the hypervisor type (based on sourcetype)
                        var hypervisor_type = tr.find("td:nth-child(2)").text();
                        var hypervisor_hostname = tr.find("td:nth-child(3)");
                        
                        switch(hypervisor_type.toLowerCase())
                        {
                            case "hypervisor:hyperv:vm":
                                hypervisor_hostname.addClass("ico_hyperv");
                                break;
                            
                            case "hypervisor:xenserver:vm":
                                hypervisor_hostname.addClass("ico_xenserver");
                                break;
                        }

                    })
               }
            });
        }
            
        break;
    
    case "host":
        $(document).ready(function() {
            var hostname = getParameterByName("hostname");
            
            if(hostname != "") {
                $('input[name="hostname"]').val(hostname);
                $("form").submit();
            } else {
                $('input[name="hostname"]').val("Search by hostname");
                $('input[name="hostname"]').focus(function(){
                    if($(this).val() == "Search by hostname") {
                        $(this).val("");
                    }
                });
            }
        });
        
        if (Splunk.Module.NullModule) {
                Splunk.Module.NullModule = $.klass(Splunk.Module.NullModule, {
                    onContextChange: function() {
                        var name = this.getContext().get("click.name");
                        var val = this.getContext().get("click.value");
                        if (name == "Hostname") {
                            location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "host") + "?hostname=" + val;
                        }
                        if (name == "VM Name") {
                            location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "vm") + "?vmname=" + val;
                        }
                    },
                });
            }
            
        if(Splunk.Module.SimpleResultsTable) {
            Splunk.Module.SimpleResultsTable = $.klass(Splunk.Module.SimpleResultsTable, {
               onResultsRendered: function($super) {
                
                    // Hide the sourcetype column for "Resident VMs"
                    $("#SimpleResultsTable_0_4_0").find("tr").find('th:nth-child(2)', this.container).hide();
                    $("#SimpleResultsTable_0_4_0").find("tr").find('td:nth-child(2)', this.container).hide();
                    
                    $("#SimpleResultsTable_0_4_0").find("tr:has(td)", this.container).each(function() {
                        var tr = $(this);
                        
                        // Get the hypervisor type (based on sourcetype)
                        var hypervisor_type = tr.find("td:nth-child(2)").text();
                        var hypervisor_hostname = tr.find("td:nth-child(3)");
                        
                        switch(hypervisor_type.toLowerCase())
                        {
                            case "hypervisor:hyperv:vm":
                                hypervisor_hostname.addClass("ico_hyperv");
                                break;
                            
                            case "hypervisor:xenserver:vm":
                                hypervisor_hostname.addClass("ico_xenserver");
                                break;
                        }

                    })
               }
            });
        }
        
        break;
    
    case "vm":
        $(document).ready(function() {
            
            var vmname = getParameterByName("vmname");
            if(vmname != "") {
                $('input[name="hostname"]').val(vmname);
                $("form").submit();
            } else {
                $('input[name="hostname"]').val("Search by VM name");
                $('input[name="hostname"]').focus(function(){
                    if($(this).val() == "Search by VM name") {
                        $(this).val("");
                    }
                });
            }
            
            $(".residentOn").click(function() {
                var hostname = $(".residentOn").children(".singleResult").html();
                location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "host?hostname=" + hostname);
            });
            
        });
        
        if (Splunk.Module.NullModule) {
                Splunk.Module.NullModule = $.klass(Splunk.Module.NullModule, {
                    onContextChange: function() {
                        var name = this.getContext().get("click.name");
                        var val = this.getContext().get("click.value");
                        if (name == "Hostname") {
                            location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "host") + "?hostname=" + val;
                        }
                        if (name == "VM Name") {
                            location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "vm") + "?vmname=" + val;
                        }
                    },
                });
            }
        
        break;
    
    case "vm_storage":
        
        if (Splunk.Module.NullModule) {
                Splunk.Module.NullModule = $.klass(Splunk.Module.NullModule, {
                    onContextChange: function() {
                        var name = this.getContext().get("click.name");
                        var val = this.getContext().get("click.value");
                        if (name == "VM") {
                            location.href=Splunk.util.make_url("app", Splunk.util.getCurrentApp(), "vm") + "?vmname=" + val;
                        }
                    },
                });
            }
        
        break;
    
    case "vm_stores":
        
        $(document).ready(function() {
            
            $('h2[title="vDisk Allocation"]').css("padding-right","0px");
            $('h2[title="vDisk Allocation"]').css("margin-right","5px");
            $('h2[title="vDisk Allocation"]').after('<a class="tooltip" href="#"><div class="help_icon"></div><span class="custom help"><img src="/static/app/SplunkAppForServerVirt/help.png" alt="Help" height="48" width="48" /><em>vDisk Allocation</em>This chart shows how much space is allocated to each vDisk within the VM store.  The actual physical usage of space may be different than how much space is allocated to a vDisk.</span></a>');
            
            $('h2[title="vDisk Usage"]').css("padding-right","0px");
            $('h2[title="vDisk Usage"]').css("margin-right","5px");
            $('h2[title="vDisk Usage"]').after('<a class="tooltip" href="#"><div class="help_icon"></div><span class="custom help"><img src="/static/app/SplunkAppForServerVirt/help.png" alt="Help" height="48" width="48" /><em>vDisk Usage</em>This chart shows how much space is used by each vDisk within the VM store.  The amount of space allocated for each vDisk may be different than how much space the vDisk is currently using.</span></a>');
            
        });
        
        Splunk.Module.SimpleResultsTable = $.klass(Splunk.Module.SimpleResultsTable, {
            renderResults: function($super,data) {
                $super(data);
                //$('td:nth-child(1),th:nth-child(1)', this.container).hide();
                $(".panel_row2_col").find('td:nth-child(1)', this.container).hide();
                $(".panel_row2_col").find('th:nth-child(1)', this.container).hide();
            }
        });
        
        
        
        break;
    
    case "event_viewer":
        
        Splunk.Module.SimpleResultsTable = $.klass(Splunk.Module.SimpleResultsTable, {
            renderResults: function($super,data) {
                $super(data);
                //$('td:nth-child(1),th:nth-child(1)', this.container).hide();
                $(".panel_row3_col").find('td:nth-child(1)', this.container).hide();
                $(".panel_row3_col").find('th:nth-child(1)', this.container).hide();
            }
        });
        
        if (Splunk.Module.NullModule) {
                Splunk.Module.NullModule = $.klass(Splunk.Module.NullModule, {
                    onContextChange: function() {
                        var val = this.getContext().get("click.value");
                        
                        $('div#evtMsg').html(val);
                        
                    },
                });
            }
        
        break;
    
    case "about":
        function getappInfo(appName) {
            $('#appinfo').append('<h2>Splunk for Server Virtualization</h2><p>Version <span id="version"></span>, Build <span id="build"></span><br/></p>');
            $.ajax({
                url: Splunk.util.make_url('/splunkd/servicesNS/-/'+appName+'/properties/app/launcher/version'),
                dataType: 'text',
                success: function(data) {
                    $('span#version').html(data);
                }
            });
            $.ajax({
                url: Splunk.util.make_url('/splunkd/servicesNS/-/'+appName+'/properties/app/install/build'),
                dataType: 'text',
                success: function(data) {
                    $('span#build').html(data);
                }
            });
        }

        $(document).ready(function() {
            getappInfo(Splunk.ViewConfig['app']['id']);
        });
        
        break;
    
}
