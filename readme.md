## Basic usage

**DZSlides** is a **one-file** HTML template to build slides in HTML5 and CSS3.

[template.html](/paulrouget/dzslides/blob/master/template.html) is the only file you need. Edit the file, add your content, change the style, and you're done. To see the slides in action, just load
the file in your browser.

## Features

* Slides can include any HTML5 content (text, image, video, iframes, …);
* Slides transitions are animated with CSS3 (sliding by default);
* Resolution independent (slides are scaled according to the size of the browser. The virtual dimension is 800x600);
* Fullscreen presentation (HTML5 FullScreen API supported) - press `f` to go fullscreen;
* Incremental content;
* Mobile Friendly (supports touch events).

## Shells

The features of DZSlides are intentionally limited to keep the template light
and simple to understand. *Shells* are extensions that bring new features
to your slides. Here, you'll find 2 shells:

* `shells/embedder.html` to embed a presentation in a web page
* `shells/onstage.html` to show your slides with a control panel

To use them, just load the file in your browser, and follow the instructions.

## Specifications

When you press the `left` and `right` keys, you go forward and go back in your slides.
But the slides can also respond to external messages. Messages can be sent through [postMessage](https://developer.mozilla.org/en/DOM/window.postMessage).
So another web page can control the slides.

### Protocol

A `cursor` is a string of this form: `3.5`. The first number represent the current slide index. The second number represent the current sub-item index.

Parameters must be escaped.

***

Messages a DZSlides page can receive:

* `REGISTER` register the source of the message as a target to notify for any events;
* `FORWARD` move forward in the slides;
* `BACK` move back in the slides;
* `START` move to the first slide;
* `END` move to the last slide;
* `SET_CURSOR cursor` jump to the cursor;
* `GET_CURSOR` notify the source of the message of the current cursor;
* `TOGGLE_CONTENT` toggle the current slide content;
* `GET_NOTES cursor` notify the source of the message of the current notes content.

Messages a DZSlides page can send:

* `CURSOR cursor` sent to one target as a response to `GET_CURSOR`, and sent to all the registered target when updated;
* `REGISTERED slides_title slides_count` sent to one target as a response to `REGISTER`;
* `NOTES html_content` sent to one target as a response to `GET_NOTES`.

***

### Hash parameters

* `url&para1=va1`

Parameters a DZSlides page can have:

* `autoplay` (integer, values : `0`/`1`, default : `1`) sets whether multimedia contents (audio, video) should be played automatically.

## License

                DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                        Version 2, December 2004

    Everyone is permitted to copy and distribute verbatim or modified
    copies of this license document, and changing it is allowed as long
    as the name is changed.

                DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
      TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

    0. You just DO WHAT THE FUCK YOU WANT TO.
