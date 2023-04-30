import org.zeromq.ZMQ;
import java.util.Random;
import java.util.Date;

class send
{
    public static void main (String [] args)
    {
        if (args.length != 1) {
            System.out.println ("usage: send <connect-to>");
            return;
        }

        String connectTo = args[0];

        ZMQ.Context ctx = ZMQ.context (1);
        ZMQ.Socket s = ctx.socket (ZMQ.REQ);

        //  Add your socket options here.
        //  For example ZMQ_RATE, ZMQ_RECOVERY_IVL and ZMQ_MCAST_LOOP for PGM.

        s.connect (connectTo);


	// Initialize random number generator
	Random srandom = new Random(System.currentTimeMillis());


	// sends random temperature data to receiver
        while (true) {
	    int temp;
	    // Random temperature from 1 to 100
	    temp = srandom.nextInt(100) + 1;
	    Date now = new Date();
	    String string = String.format("%d\u0000", temp);
	    string = now.toString() + " Temperature=" + string;
	    s.send (string.getBytes(), 0);
	    // get back acknowledgement
	    byte data2[] = s.recv (0);
	    try {
		Thread.sleep(500);
	    } catch (Exception e) {

	    }
        }


    }
}

