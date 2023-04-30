import org.zeromq.ZMQ;

class receive
{
    public static void main (String [] args)
    {
        if (args.length != 1) {
            System.out.println ("usage: receive <bind-to>");
            return;
        }

        String bindTo = args [0];

        ZMQ.Context ctx = ZMQ.context (1);
        ZMQ.Socket s = ctx.socket (ZMQ.REP);

        //  Add your socket options here.
        //  For example ZMQ_RATE, ZMQ_RECOVERY_IVL and ZMQ_MCAST_LOOP for PGM.

        s.bind (bindTo);

        while (true) {
            byte [] data = s.recv (0);
	    s.send ("yes".getBytes(), 0);
	    String str = new String(data);
	    // Replace last character which is a \x00 padding
	    str = str.substring(0, str.length() - 1);
            System.out.println(str);
        }


    }
}
