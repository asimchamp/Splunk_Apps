#!/bin/sh

# Date Functions taken and modified from http://cfajohnson.com/shell/ssr/08-The-Dating-Game.shtml
# Refereced GNU Public License - http://shell.cfajohnson.com/date-functions/?COPYING


date_vars()
{
    TODAY=`date +%Y-%m-%d`
	YEAR=`echo $TODAY | $AWK -F "-" '{ print $1 }'`
    MONTH=`echo $TODAY | $AWK -F "-" '{ print $2 }'`    
    DAY=`echo $TODAY | $AWK -F "-" '{ print $3 }'`
}

# Usage: split_date `date +%Y-%m-%d` ; returns $SD_YEAR $SD_MONTH $SD_DAY
split_date()
{
  ## Assign defaults when no variable names are given on the command line
    sd_1=${2:-SD_YEAR}
    sd_2=${3:-SD_MONTH}
    sd_3=${4:-SD_DAY}
    
	SD2_MONTH=`echo $1 | $AWK -F "-" '{ print $2 }'`
	SD2_DAY=`echo $1 | $AWK -F "-" '{ print $3 }'`
	
    oldIFS=$IFS        ## save current value of field separator
    IFS="-/. $TAB$NL"  ## new value allows date to be supplied in other formats
    set -- $1          ## place the date into the positional parameters
    IFS=$oldIFS        ## restore IFS
    [ $# -lt 3 ] && return 1  ## The date must have 3 fields

    ## Remove leading zeroes and assign to variables
    eval "$sd_1=\"${1#0}\" $sd_2=\"${2#0}\" $sd_3=\"${3#0}\""
}


# Usage: is_leap_year $SD_YEAR ; returns 1 if leap year 0 if no leap year
# Example Usage: is_leap_year $SD_YEAR && echo yes || echo no
is_leap_year() { ## USAGE: is_leap_year [year]
    ily_year=${1:-$(date +%Y)}
    case $ily_year in
        *0[48] |\
        *[2468][048] |\
        *[13579][26] |\
        *[13579][26]0|\
        *[2468][048]00 |\
        *[13579][26]00 ) _IS_LEAP_YEAR=1
                         return 0 ;;
        *) _IS_LEAP_YEAR=0
           return 1 ;;
    esac
}

# Usage _days_in_month $SD_MONTH $SD_YEAR ; returns $_DAYS_IN_MONTH
_days_in_month()
{
   case $1 in
        "") date_vars
        	dim_y=$YEAR
      		dim_m=$MONTH
            ;;
        *)	dim_m=$1         ## $1 is the month
      		dim_y=$2         ## $2 is the year
      		;;
   esac

    case ${dim_m#0} in
        ## For all months except February,
        ## a simple look-up table is all that's needed
        9|4|6|11) _DAYS_IN_MONTH=30 ;; ## 30 days hath September...
        1|3|5|7|8|10|12) _DAYS_IN_MONTH=31 ;;

        ## For February, the year is needed in order to check
        ## whether it is a leap year
        2) is_leap_year ${dim_y:-`date +%Y`} &&
             _DAYS_IN_MONTH=29 || _DAYS_IN_MONTH=28 ;;
        *) return 5 ;;
    esac
}

#Usage days_in_month $SD_MONTH $SD_YEAR ; returns NUMBER of days in month
days_in_month()
{
    _days_in_month $@ && printf "%s\n" $_DAYS_IN_MONTH
}

#Usage: date2julian [YEAR-MONTH-DAY] ; returns $_DATE2JULIAN
_date2julian()
{
   ## If there's no date on the command line, use today's date
   case $1 in
        "") date_vars  ## From standard-funcs, Chapter 1
            set -- $TODAY
            ;;
   esac

   ## Break the date into year, month, and day
   split_date "$1" d2j_year d2j_month d2j_day || return 2

   ## Since leap years add a day at the end of February,
   ## calculations are done from 1 March 0000 (a fictional year)
   d2j_tmpmonth=$((12 * $d2j_year + $d2j_month - 3))

   ## If it is not yet March, the year is changed to the previous year
   d2j_tmpyear=$(( $d2j_tmpmonth / 12))

   ## The number of days from 1 March 0000 is calculated
   ## and the number of days from 1 Jan. 4713BC is added
   _DATE2JULIAN=$((
        (734 * $d2j_tmpmonth + 15) / 24 -  2 * $d2j_tmpyear + $d2j_tmpyear/4
        - $d2j_tmpyear/100 + $d2j_tmpyear/400 + $d2j_day + 1721119 ))
}

# Example Usage: date2julian [YEAR-MONTH-DAY] ; returns NUMBER
date2julian()
{
    _date2julian "$1" && printf "%s\n" "$_DATE2JULIAN"
}

# ISO date from JD number
# Example Usage: _julian2date JulianDayNumber;  returns YYYY-MM-DD as $_JULIAN2DATE
_julian2date()
{
    ## Check for numeric argument
    case $1 in
        ""|*[!0-9]*) return 1 ;;
    esac

    ## To avoid using decimal fractions, the script uses multiples.
    ## Rather than use 365.25 days per year, 1461 is the number of days
    ## in 4 years; similarly, 146097 is the number of days in 400 years
    j2d_tmpday=$(( $1 - 1721119 ))
    j2d_centuries=$(( (4 * $j2d_tmpday - 1) / 146097))
    j2d_tmpday=$(( $j2d_tmpday + $j2d_centuries - $j2d_centuries/4))
    j2d_year=$(( (4 * $j2d_tmpday - 1) / 1461))
    j2d_tmpday=$(( $j2d_tmpday - (1461 * $j2d_year) / 4))
    j2d_month=$(( (10 * $j2d_tmpday - 5) / 306))
    j2d_day=$(( $j2d_tmpday - (306 * $j2d_month + 5) / 10))
    j2d_month=$(( $j2d_month + 2))
    j2d_year=$(( $j2d_year + $j2d_month/12))
    j2d_month=$(( $j2d_month % 12 + 1))

    ## pad day and month with zeros if necessary
    case $j2d_day in ?) j2d_day=0$j2d_day;; esac
    case $j2d_month in ?) j2d_month=0$j2d_month;; esac

    _JULIAN2DATE=$j2d_year-$j2d_month-$j2d_day
}

#Example Usage: julian2date JulianDayNumber ; returns YYYY-MM-DD
julian2date()
{
    _julian2date "$1" && printf "%s\n" "$_JULIAN2DATE"
}

#Example Usage: _dateshift YYYY-MM-DD OFFSET
#Example Usage: _dateshift `date +%Y-%m-%d` +12
_dateshift()
{
    case $# in
        ## If there is only 1 argument, it is the offset
        ## so use todays date
        0|1) ds_offset=${1:-0}
             date_vars
             ds_date=$TODAY
             ;;
        ## ...otherwise the first argument is the date
        *) ds_date=$1
           ds_offset=$2
           ;;
    esac
    while :
    do
       case $ds_offset in
           0*|+*) ds_offset=${ds_offset#?} ;; ## Remove leading zeros or plus signs
           -*) break ;;                       ## Negative value is OK; exit the loop
           "") ds_offset=0; break ;;          ## Empty offset equals 0; exit loop
           *[!0-9]*) return 1 ;;              ## Contains non-digit; return error
           *) break ;;                        ## Let's assume it's OK and continue
       esac
    done
    ## Convert to Julian Day
    _date2julian "$ds_date"
    ## Add offset and convert back to ISO date
    _julian2date $(( $_DATE2JULIAN + $ds_offset ))
    ## Store result
    _DATESHIFT=$_JULIAN2DATE
}

dateshift()
{
    _dateshift "$@" && printf "%s\n" "$_DATESHIFT"
}

_yesterday()
{
    _date2julian "$1"
    _julian2date $(( $_DATE2JULIAN - 1 ))
    _YESTERDAY=$_JULIAN2DATE
}

_tomorrow()
{
    _date2julian "$1"
    _julian2date $(( $_DATE2JULIAN + 1 ))
    _TOMORROW=$_JULIAN2DATE
}

_diffdate()
{
    case $# in
        ## If there's only one argument, use today's date
        1) _date2julian "$1"
           dd2=$_DATE2JULIAN
           _date2julian
           dd1=$_DATE2JULIAN
           ;;
        2) _date2julian "$1"
           dd1=$_DATE2JULIAN
           _date2julian "$2"
           dd2=$_DATE2JULIAN
           ;;
    esac
    _DIFFDATE=$(( $dd2 - $dd1 ))
}

diffdate()
{
    _diffdate "$@" && printf "%s\n" "$_DIFFDATE"
}						