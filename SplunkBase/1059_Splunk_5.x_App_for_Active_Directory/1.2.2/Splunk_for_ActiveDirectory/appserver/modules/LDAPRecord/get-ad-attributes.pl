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

STDERR->autoflush(1);

sub trim($) {
	my $s = shift;
	
	$s =~ s/^\s*//; $s =~ s/\s*$//;
	return $s;
}

print STDERR "Loading All Attributes Page\n";
my $ua = LWP::UserAgent->new();
my $all_attributes = $ua->get('http://msdn.microsoft.com/en-us/library/windows/desktop/ms675090%28v=vs.85%29.aspx');
die "Could not get All Attributes page: $@\n" unless ($all_attributes);
die "Could not get All Attributes Page: ".$all_attributes->status_line."\n" unless ($all_attributes->is_success);
my $content = $all_attributes->content;
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
my %adAttributes;
print STDERR "Found $cnt Attribute Definitions - Loading each one in turn\n";
foreach my $url (keys %links) {
	$i++;
	
	my $r = $ua->get($url);
	# It's possible that this is not successful
	next unless ($r && $r->is_success);
	
	# Otherwise, let's take a look at the content
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
	if (!defined $ln || $ln eq "") {
		next;
	}
	$adAttributes{$cn} = $ln;
	print STDERR "$i/$cnt - $cn\n";
}

open(F, ">attributes.js-gist");
print F "\tadSchemaAttributes: {\n";
foreach my $cn (sort keys %adAttributes) {
	my $ln = $adAttributes{$cn};
	print F "\t\t'$cn':\t'$ln',\n";
}
print F "\t},\n";
close(F);

print STDERR "GIST is in attributes.js-gist\n";
