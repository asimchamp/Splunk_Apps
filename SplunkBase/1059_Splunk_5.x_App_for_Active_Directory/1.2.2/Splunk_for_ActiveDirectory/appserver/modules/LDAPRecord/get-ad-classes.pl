#!/usr/bin/perl -w
#
# Script to pull the AD Schema Attribute Definitions from MSDN
#
use strict;
use vars;

use LWP::UserAgent;
use HTML::LinkExtractor;
use IO::Handle;
use Data::Dumper;

$Data::Dumper::Terse = 1;
$Data::Dumper::Pair  = ': ';

STDERR->autoflush(1);

sub trim($) {
	my $s = shift;
	
	$s =~ s/^\s*//; $s =~ s/\s*$//;
	return $s;
}

print STDERR "Loading All Classes Page\n";
my $ua = LWP::UserAgent->new();
my $all_classes = $ua->get('http://msdn.microsoft.com/en-us/library/windows/desktop/ms680938%28v=vs.85%29.aspx');
die "Could not get All Classes page: $@\n" unless ($all_classes);
die "Could not get All Classes Page: ".$all_classes->status_line."\n" unless ($all_classes->is_success);
my $content = $all_classes->content;
my $linkex  = new HTML::LinkExtractor();
$linkex->parse(\$content);
my @links = @{$linkex->links};

# Skip the ones we don't want and make sure we don't have any duplicates
my %links;
foreach my $link (@links) {
	my %link = %$link;
	next if ($link{'tag'} ne "a");
	next if (exists($link{'class'}));
	next if ($link{'href'} !~ m#http://msdn.microsoft.com/en-us/library/windows/desktop/#);
	my $title = $link{'title'} || "unknown";
	$links{$link{'href'}} = $title;
}

my $i = 0;
my $cnt = scalar(keys %links);

print STDERR "Found $cnt Class Definitions - Loading each one in turn\n";
my %ldapMap;

open(C, ">classes.js-gist");
print C "\tadSchemaClasses: {\n";
foreach my $url (keys %links) {
	$i++;
	
	#next unless ($url =~ /\/ms683980/);  # This is the User class for testing
	
	my $r = $ua->get($url);
	# It's possible that this is not successful
	next unless ($r && $r->is_success);
	
	# We need to store the LDAP and CN names first into the ldapMap
	my ($cn, $ln);
	$cn = trim($1) if ($r->content =~ m#<tr><th>CN</th><td>([^<]+)</td></tr>#);
	$ln = trim($1) if ($r->content =~ m#<tr><th>Ldap-Display-Name</th><td>([^<]+)</td></tr>#);
	
	if (!defined $cn || $cn eq "") {
		if ($links{$url} ne "unknown") {
			$cn = $links{$url}
		} else {
			# No cn - skip it
			next;
		}
	}
	# No LDAP Name either, so skip it
	if (!defined $ln || $ln eq "") {
		next;
	}
	$ldapMap{$ln} = $cn;
	
	# Now we need to get the list of auxiliary classes
	my $auxClasses;
	$auxClasses = trim($1) if ($r->content =~ m#<tr><th>Auxiliary Classes</th><td>[\s\r\n]*(.*?)</td></tr>#);
	if ($auxClasses && $auxClasses ne "-") {
		my $aclx = new HTML::LinkExtractor;
		my @auxClasses;
		$aclx->parse(\$auxClasses);
		foreach my $ll (@{$aclx->links}) {			
			push @auxClasses, $1 if ($$ll{'_TEXT'} =~ m#>([^<]+)<#);
		}
		$auxClasses = \@auxClasses;
	} else {
		$auxClasses = [];
	}
	
	# Finally, get a list of all the possible attributes.
	my @lines = ($r->content =~ m#<tr>(.*?)</tr>#msg);
	my %attributes;
	foreach my $aline (@lines) {
		$aline =~ s/[\s\r\n]+/ /msg;
		if ($aline =~ m#<strong>$cn</strong>#) {
			my $attrName = $1 if ($aline =~ m#<strong xmlns="http://www.w3.org/1999/xhtml">([^<]+)</strong>#);
			$attributes{$attrName} = 1;
		}
	}
	my @attributes = sort keys %attributes;
	
	my %rec = (
		'ldapname' 		=> $ln,
		'classes'		=> $auxClasses,
		'attributes'	=> \@attributes
	);
	my $str = Dumper(\%rec);
	$str =~ s/\n/\n\t\t\t/g;
	$str =~ s/[\s\r\n]*$//;
	print C "\t\t'$cn': ", $str, ",\n";
	
	print STDERR "$i/$cnt - $cn\n";
	
}
print C "\t},\n";
close(C);
print STDERR "GIST is in classes.js-gist\n";

open(F, ">ldapMap.js-gist");
print F "\tadLDAPClasses: {\n";
foreach my $ln (sort keys %ldapMap) {
	my $cn = $ldapMap{$ln};
	print F "\t\t'$ln':\t'$cn',\n";
}
print F "\t},\n";
close(F);

print STDERR "GIST is in ldapMap.js-gist\n";