//global variables
var csrf = 'e71a4b90-d381-4d04-89d9-786a934ba564',
	userGuid = '9cdadbf8a2744e9ebbc8467b68d743b6',
	baseUrl = 'http://localhost:3030/',
	cmsUrl = 'https://CMS_URL.com/',
	kmApiKey = 'e292a81db253ff17d667516119915eac2c2a4171',
	gaApiKey = 'UA-25424568-2',
	domainName = 'localhost',
	feedUrl = 'http://www.personalcapital.com/dailycapital/category/investing/feed/',
	staticUrl = '',
	resourceVersion = '.1184';
//page variables
var numberOfAccounts = 16,
	redirectTo = '',
	showFirstUse = false,
	installedPlugin = false,
	betaTester = false,
	developer = false,
	username ='mock@name.com',
	usernameFirst = 'Mock',
	usernameLast = 'User',
	isQuestionnaireAnswered = true;

var staticVersion = '.80';

//PFA-6641
if( typeof redirectTo == 'string' && redirectTo != '' ){
	window.location = redirectTo;
}