'use strict';

/**
 * Passenger / LiteSpeed entry.
 * The host loads the startup file with require() — it cannot run ESM
 * top-level await (ERR_REQUIRE_ASYNC_MODULE → broken Node app).
 */
require('tsx/cjs');
require('./server/index.ts');
