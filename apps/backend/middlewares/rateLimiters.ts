import rateLimit, { MemoryStore } from 'express-rate-limit';

const cronJobsActionsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20, // Limit each IP to 100 requests per windowMs
    message: {'error': 'Too many requests mate, please try again later.'},
    statusCode: 429,
    handler:(req,res,next)=>{

    },
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    standardHeaders: 'draft-6', // Enable the `RateLimit-*` headers
    identifier: 'web3builders-dao-dapp',
    store: new MemoryStore(), // Use in-memory store for rate limiting
    passOnStoreError: false, // Do not pass errors from the store to the client
    skip: (req, res) => {
        // Skip rate limiting for specific routes or conditions
        return false; // Apply rate limiting to all requests
    },
    skipSuccessfulRequests: false, // Do not skip successful requests
    skipFailedRequests: false, // Do not skip failed requests
    requestWasSuccessful: (req, res) => {
        // Custom logic to determine if the request was successful
        return res.statusCode < 400; // Consider requests with status codes < 400 as successful
    },
    validate:{
        'ip': true, // Validate the IP address of the request

        
    }
});


export { cronJobsActionsLimiter };