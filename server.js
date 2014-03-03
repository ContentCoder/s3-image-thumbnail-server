/* 
 * server.js 
 * 
 * S3 image thumbnail server.
 * 
 * version: 0.0.1 
 * create date: 2014-2-25
 * update date: 2014-2-25
 */

var util		= require('util'), 
		path		= require('path'), 
		http		= require('http'), 
		url			= require('url'), 
		s3Thumb	= require(path.join(__dirname, 'lib/s3-image-thumbnail/s3-thumbnail.js'));

// load configuration
var config  = require(path.join(__dirname, 'config.json'));
util.log(JSON.stringify(config, null, 2));

// launch server 
var port = process.env.PORT || config.PORT;
http.createServer(function(req, res) {
  util.log(req.method + ' ' + req.url);
  req.parsedUrl = url.parse(req.url, true);
  switch (req.method + req.parsedUrl.pathname) {
  case 'GET/thumbnail':
    getThumbnail(req, res);
    return;
  default:
    responseJSON(res, 404, {message: '404 Not Found'});
    return;
  }
}).listen(port);
util.log(util.format('S3 image thumbnail server running at %d port...', port));

/* 
 * S3 image thumbnail route.
 * 
 * Request: 
 *  Method: GET
 *  Path: /thumbnail
 *  Query String:   
 *    imagebucket: S3 image bucket
 *    imagekey: S3 image key
 *		thumbbucket: S3 thumbnail bucket
 *		thumbkey:	S3 thumbnail key
 *    width: thumbnail width
 *    height: thumbnail height
 *    crop: crop method, 'Center' or 'North'
 * 
 * Response:
 *  Error: 
 *    Status Code: 
 *      400 Bad Request
 *      500 Internal Server Error
 *    Content Type: application/json
 *    Body: error message
 *  Data: 
 *    Status Code: 200 OK
 *    Content Type: application/json
 *    Body: thumbnail data
 */
function getThumbnail(req, res) {
	if (!req.parsedUrl.query.imagebucket || 
			!req.parsedUrl.query.imagekey || 
			!req.parsedUrl.query.thumbbucket ||
			!req.parsedUrl.query.thumbkey) {
    responseJSON(res, 400, {message: '400 Bad Request'});
    return;
  }

	var image		= {},
			thumb		= {}, 
			options	= {};
	image.Bucket		= req.parsedUrl.query.imagebucket;
	image.Key				= req.parsedUrl.query.imagekey;
	thumb.Bucket		= req.parsedUrl.query.thumbbucket;
	thumb.Key				= req.parsedUrl.query.thumbkey;
	options.width		= req.parsedUrl.query.width;
	options.height	= req.parsedUrl.query.height;
	options.crop		= req.parsedUrl.query.crop;
	s3Thumb.create(image, thumb, options, function(err, data) {
		if (err) {
			responseJSON(res, 500, err);
		} else {
			responseJSON(res, 200, data);
		}
	});
}

function responseJSON(res, statusCode, msg) {
  res.writeHead(statusCode, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(msg));
  util.log(JSON.stringify(msg));
  return;
}


