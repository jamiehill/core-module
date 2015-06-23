// matches leading and trailing slashes in a url
export var leadingTrailingSlashes = /^\/+|\/+$/g;

// matches the protocol segment in a url
export var urlPrototcol = /(?:(?:https?|ftp|wss?):\/\/)/g;

// matches ip addresses in urls
export var ipAddress = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})/;

// matches the port number in urls
export var portNumber = /:\d+/g;
