BEGIN { }
{
  if ($0 == "CPU") {
    event = "CPU";
    next;
  }  
  
  if ($0 == "DEVICE") {
    event = "DEVICE";
    next;
  }
  
  if ($0 == "RUNQ") {
    event = "RUNQ";
    next;
  } 
  
  if ($0 == "BREAD") {
    event = "BREAD";
    next;
  } 
  
  if ($0 == "SWPIN") {
    event = "SWPIN";
    next;
  }
  
  if ($0 == "SCALL") {
    event = "SCALL";
    next;
  }
  
  if ($0 == "IGET") {
    event = "IGET";
    next;
  }
  
  if ($0 == "RAWCH") {
    event = "RAWCH";
    next;
  }
  
  if ($0 == "PROC-SZ") {
    event = "PROC-SZ";
    next;
  }
  
  if ($0 == "MSG") {
    event = "MSG";
    next;
  }
  
  if ($0 == "ATCH") {
    event = "ATCH";
    next;
  }
  
  if ($0 == "PGOUT") {
    event = "PGOUT";
    next;
  }
  
  if ($0 == "FREEMEM") {
    event = "FREEMEM";
    next;
  }
  
  if ($0 == "SML_MEM") {
    event = "SML_MEM";
    next;
  }
  
  if (event == "CPU")
    #print $0, "sourcetype=sar_cpu";
    #printf "%s %s %s pct_usr=%s pct_sys=%s pct_wio=%s pct_idle=%s st=sar:cpu_util\n",$1,$2,$7,$3,$4,$5,$6;
    printf "%s %s %s pct_usr=%s pct_sys=%s pct_wio=%s pct_idle=%s\n",$1,$2,$7,$3,$4,$5,$6;

  
  if (event == "DEVICE") {
    if ($0 ~ /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/ ) {
      date=$1; time=$2;
      #print $0, "sourcetype=sar_disk";
      #printf "%s %s %29s %14s %7s %7s %7s %7s %7s %7s sourcetype=sar_disk\n",$1,$2,$3,$4,$5,$6,$7,$8,$9,$10 ;
      #printf "%s %s %s device=%s pct_busy=%s avque=%s rw_per_sec=%s blks_per_sec=%s avwait=%s avserv=%s st=sar:disk_activity\n",$1,$2,$10,$3,$4,$5,$6,$7,$8,$9 ;
      printf "%s %s %s device=%s pct_busy=%s avque=%s rw_per_sec=%s blks_per_sec=%s avwait=%s avserv=%s\n",$1,$2,$10,$3,$4,$5,$6,$7,$8,$9 ;
    }  
    #print $0, "sourcetype=sar_disk";
    if ($0 !~ /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/ )
      #print date,time,$0, "sourcetype=sar_disk";
      #printf "%s %s %s device=%s pct_busy=%s avque=%s rw_per_sec=%s blks_per_sec=%s avwait=%s avserv=%s st=sar:disk_activity\n",date,time,$8,$1,$2,$3,$4,$5,$6,$7 ;
      #printf "%s device=%s pct_busy=%s avque=%s rw_per_sec=%s blks_per_sec=%s avwait=%s avserv=%s st=sar:disk_activity\n",$8,$1,$2,$3,$4,$5,$6,$7 ;
      printf "%s device=%s pct_busy=%s avque=%s rw_per_sec=%s blks_per_sec=%s avwait=%s avserv=%s\n",$8,$1,$2,$3,$4,$5,$6,$7 ;

  }  
    
  if (event == "RUNQ")
  	#print $0, "sourcetype=sar_runq";
  	#printf "%s %s %s runq_sz=%s pct_runocc=%s swpq_sz=%s pct_swpocc=%s st=sar:queue_activity\n",$1,$2,$7,$3,$4,$5,$6;
  	printf "%s %s %s runq_sz=%s pct_runocc=%s swpq_sz=%s pct_swpocc=%s\n",$1,$2,$7,$3,$4,$5,$6;
  	
  if (event == "BREAD")
  	#print $0, "sourcetype=sar_bread";
  	#printf "%s %s %s bread_per_sec=%s lread_per_sec=%s pct_rcache=%s bwrit_per_sec=%s lwrit_per_sec=%s pct_wcache=%s pread_per_sec=%s pwrit_per_sec=%s st=sar:buffer_activity\n", $1,$2,$11,$3,$4,$5,$6,$7,$8,$9,$10; 
  	printf "%s %s %s bread_per_sec=%s lread_per_sec=%s pct_rcache=%s bwrit_per_sec=%s lwrit_per_sec=%s pct_wcache=%s pread_per_sec=%s pwrit_per_sec=%s\n", $1,$2,$11,$3,$4,$5,$6,$7,$8,$9,$10; 
  	
  if (event == "SWPIN")
  	#print $0, "sourcetype=sar_swpin";
  	#printf "%s %s %s swpin_per_sec=%s bswin_per_sec=%s swpot_per_sec=%s bswot_per_sec=%s pswch_per_sec=%s st=sar:swap_activity\n",$1,$2,$8,$3,$4,$5,$6,$7;
  	printf "%s %s %s swpin_per_sec=%s bswin_per_sec=%s swpot_per_sec=%s bswot_per_sec=%s pswch_per_sec=%s\n",$1,$2,$8,$3,$4,$5,$6,$7;
  	
  if (event == "SCALL")
  	#print $0, "sourcetype=sar_scall";
  	#printf "%s %s %s scall_per_sec=%s sread_per_sec=%s swrit_per_sec=%s  fork_per_sec=%s  exec_per_sec=%s rchar_per_sec=%s wchar_per_sec=%s st=sar:system_call_stats\n", $1,$2,$10,$3,$4,$5,$6,$7,$8,$9;	
  	printf "%s %s %s scall_per_sec=%s sread_per_sec=%s swrit_per_sec=%s  fork_per_sec=%s  exec_per_sec=%s rchar_per_sec=%s wchar_per_sec=%s\n", $1,$2,$10,$3,$4,$5,$6,$7,$8,$9;	
  	
  if (event == "IGET")
  	#print $0, "sourcetype=sar_iget";
  	#printf "%s %s %s iget_per_sec=%s namei_per_sec=%s dirbk_per_sec=%s st=sar:file_access\n",$1,$2,$6,$3,$4,$5;
  	printf "%s %s %s iget_per_sec=%s namei_per_sec=%s dirbk_per_sec=%s\n",$1,$2,$6,$3,$4,$5;
  
  if (event == "RAWCH")
  	#print $0, "sourcetype=sar_rawch";
   	#printf "%s %s %s rawch_per_sec=%s canch_per_sec=%s outch_per_sec=%s rcvin_per_sec=%s xmtin_per_sec=%s mdmin_per_sec=%s st=sar:terminal_activity\n",$1,$2,$9,$3,$4,$5,$6,$7,$8;
 	printf "%s %s %s rawch_per_sec=%s canch_per_sec=%s outch_per_sec=%s rcvin_per_sec=%s xmtin_per_sec=%s mdmin_per_sec=%s\n",$1,$2,$9,$3,$4,$5,$6,$7,$8;
  	
  if (event == "PROC-SZ")
  	#print $0, "sourcetype=sar_procsz";
  	#printf "%s %s %s proc_sz=%s ov_proc_sz=%s inod_sz=%s ov_inod-sz=%s file_sz=%s ov_file_sz=%s lock_sz=%s st=sar:system_table_status\n",$1,$2,$10,$3,$4,$5,$6,$7,$8,$9;	
  	printf "%s %s %s proc_sz=%s ov_proc_sz=%s inod_sz=%s ov_inod-sz=%s file_sz=%s ov_file_sz=%s lock_sz=%s\n",$1,$2,$10,$3,$4,$5,$6,$7,$8,$9;	
  	
  if (event == "MSG")
  	#print $0, "sourcetype=sar_msg";
  	#printf "%s %s %s msg_per_sec=%s sema_per_sec=%s st=sar:interproc_comm\n", $1,$2,$5,$3,$4;	
  	printf "%s %s %s msg_per_sec=%s sema_per_sec=%s\n", $1,$2,$5,$3,$4;	

  	
  if (event == "ATCH")
  	#print $0, "sourcetype=sar_atch";
  	#printf "%s %s %s atch_per_sec=%s pgin_per_sec=%s ppgin_per_sec=%s pflt_per_sec=%s vflt_per_sec=%s slock_per_sec=%s st=sar:page-in_activity\n",$1,$2,$9,$3,$4,$5,$6,$7,$8; 
  	printf "%s %s %s atch_per_sec=%s pgin_per_sec=%s ppgin_per_sec=%s pflt_per_sec=%s vflt_per_sec=%s slock_per_sec=%s\n",$1,$2,$9,$3,$4,$5,$6,$7,$8; 
  	
  if (event == "PGOUT")
  	#print $0, "sourcetype=sar_pgout";
  	#printf "%s %s %s pgout_per_sec=%s ppgout_per_sec=%s pgfree_per_sec=%s pgscan_per_sec=%s pct_ufs_ipf=%s st=sar:page-out_and_mem\n",$1,$2,$8,$3,$4,$5,$6,$7;
  	printf "%s %s %s pgout_per_sec=%s ppgout_per_sec=%s pgfree_per_sec=%s pgscan_per_sec=%s pct_ufs_ipf=%s\n",$1,$2,$8,$3,$4,$5,$6,$7;
  	
  if (event == "FREEMEM")
  	#print $0, "sourcetype=sar_freemem";
  	#printf "%s %s %s freemem=%s freeswap=%s st=sar:unused_mem\n",$1,$2,$5,$3,$4;	
  	printf "%s %s %s freemem=%s freeswap=%s\n",$1,$2,$5,$3,$4;	
  	
  if (event == "SML_MEM")
  	#print $0, "sourcetype=sar_smlmem";
  	#printf "%s %s %s sml_mem=%s alloc_sml_mem=%s fail_sml_mem=%s lg_mem=%s alloc_lg_mem=%s fail_lg_mem=%s ovsz_alloc=%s  fail_ovsz_alloc=%s st=sar:kernel_mem_alloc\n",$1,$2,$11,$3,$4,$5,$6,$7,$8,$9,$10;	
  	printf "%s %s %s sml_mem=%s alloc_sml_mem=%s fail_sml_mem=%s lg_mem=%s alloc_lg_mem=%s fail_lg_mem=%s ovsz_alloc=%s  fail_ovsz_alloc=%s\n",$1,$2,$11,$3,$4,$5,$6,$7,$8,$9,$10;	
  			
}
END { }