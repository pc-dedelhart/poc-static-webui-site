var curYFrameId = 'yFrame';
var otherYFrameId = 'yFrame2';

var blankUrl = null;

function resizeYFrame()
{
	_resizeYFrame(curYFrameId);
	_resizeYFrame(otherYFrameId);
}

function _resizeYFrame(frameId)
{
	var winWidth = $(window).width();
	var winHeight = $(window).height();
	var frameTop = parseInt( $('#' + frameId + 'Container').css('top') , 10 );
	$('#' + frameId + 'Container').width( winWidth );
	$('#' + frameId + 'Container').height( winHeight - frameTop );
}

function toggleYFrame()
{
	if (isYFrameOpen())
	{
		closeYFrame();
	}
	else
	{
		openYFrame();
	}
}

function isYFrameOpen()
{
	return $('#' + curYFrameId + 'Container').css('visibility') == 'visible';
}

function openYFrame()
{
	$('#' + curYFrameId + 'Container').css( 'visibility' , 'visible' );
}

function closeYFrame(frameId)
{
	if (frameId == undefined || frameId == null)
		frameId = curYFrameId;

	$('#' + frameId + 'Container').css( 'visibility' , 'hidden' );
}

function clearYFrame(frameId)
{
	if (frameId == undefined || frameId == null)
		frameId = curYFrameId;
		
	if (blankUrl != null)
		$('#' + frameId).attr('src',blankUrl);
}

function shutdownYFrame()
{
	closeYFrame(curYFrameId);
	clearYFrame(curYFrameId);
	
	closeYFrame(otherYFrameId);
	clearYFrame(otherYFrameId);
}
			
function switchCurrentYFrame()
{
	var tmpYFrame = curYFrameId;
	
	curYFrameId = otherYFrameId;
	otherYFrameId = tmpYFrame;
	
	// other y frame to blank
	closeYFrame(otherYFrameId);
	clearYFrame(otherYFrameId);
}
			
function goToPage(url,params,toggleCurYFrame)
{
	if (url == null)
	{
		closeYFrame();
		return;
	}
	
	if (toggleCurYFrame != undefined && toggleCurYFrame != null && toggleCurYFrame == true)
	{
		switchCurrentYFrame();
	}

	var yFrameId = curYFrameId;
	
	try 
	{
		var form = $('#' + yFrameId + 'Form');
		
		if (form.length == 0)
		{
			$('#' + yFrameId + 'Container').append("<form id='" + yFrameId + "Form'><input type='hidden' name='SAMLResponse' id='SAMLResponse' /><input type='hidden' name='TARGET' id='TARGET' /></form>");
			form = $('#' + yFrameId + 'Form');
			form.attr("target", yFrameId);
			form.attr("method", "POST");
		}
		
		form.attr("action", url);
		
		if (params) 
		{
			for (param in params) 
			{
				var input = $("#" + yFrameId + "Form > " + "#" + param);
				
				if (input.length != 0)
				{
					input.attr("value", decodeURIComponent(params[param]) );
				}
			}
		}
		
		form.submit();
		openYFrame();
	} 
	catch (e) 
	{
		DEBUG("Failed to submit form with action " + url + " because: " + e);
		return;
	}
	
}

function setBlankUrl(url)
{
	blankUrl = url;
}
