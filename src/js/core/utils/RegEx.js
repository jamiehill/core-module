// matches leading and trailing slashes in a url
export var leadingTrailingSlashes = /^\/+|\/+$/g;

// matches the protocol segment in a url
export var urlPrototcol = /(?:(?:https?|ftp|wss?):\/\/)/g;

// matches ip addresses in urls
export var ipAddress = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})/;

// matches the port number in urls
export var portNumber = /:\d+/g;

// Matches any digit(s) (i.e. 0-9)
export var digits = /^\d+$/;

// Matches only alpha characters
export var alpha = /^[a-z]$/i;

// Matches only alphabets upper and lower case
export var string = /^[a-z]*$/i;

// Matches only alphabets upper and lower case with spaces
export var alphabetsWithSpaces = "^[A-Za-z \s]*$";

// Matches phone number
export var phone = "^[0-9.-]*$";

// Matches Alpha, numbers and space, no special characters
export var alphaNumeric = "^[0-9a-zA-Z !@\#\$%\^&\*\(\)\-\=\_\+]+$";

//Username, alpha numeric with space
export var username = "^[0-9A-Za-z]*$";

// Password - supports alpha, numeric, special characters, min 6 max 20
export var password = "^[A-Za-z0-9!@#$%^&*()_]$"

// Matches any number (e.g. 100.000)
export var number = "^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$"

// Matches a valid email address (e.g. mail@example.com)
export var email = "^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$";
//export var email: "([\w\.\-_]+)?\w+@[\w-_]+(\.\w+)",
//export var email: "^[A-Za-z0-9@.-_]*$",

// Matches any valid url (e.g. http://www.example.com)
export var url = "^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$";

// Matches scores from the end of selection name for markets
// such as Correct Score.  allows for optional spaces between
// digits and numbers, for example:
// Bayer 04 Leverkusen 1 - 0 = '1 - 0'
// Bayer 04 Leverkusen 1-0 = '1-0'
export var scores = /\d+\s?-\s?\d+$/;
