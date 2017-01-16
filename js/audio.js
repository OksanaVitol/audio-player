/**
 * Created by Oksana Vitol on 12.01.2017. Audio Player only for .mp3 files(Front-end part).
 */
;(function () {
    var player = {
        audio: null,
        playBtn: null,
        pauseBtn: null,
        durationLbl: null,
        stopBtn: null,
        prevBtn: null,
        nextBtn: null,
        muteBtn: null,
        volumeInput: null,
        seekInput: null,
        list: null,
        initialize: function () {
            this.playBtn = $('#play');
            this.pauseBtn = $('#pause');
            this.stopBtn = $('#stop');
            this.prevBtn = $('#prev');
            this.nextBtn = $('#next');
            this.durationLbl = $('#duration');
            this.list = $('#playlist');
            this.muteBtn = $('#mute');
            this.volumeInput = $("#volume");
            this.seekInput = $("#seek");

            this.initEvents();
            this.initDefaults();
        },
        initEvents: function () {
            this.playBtn.on('click', $.proxy(this.play, this));
            this.stopBtn.on('click', $.proxy(this.stop, this));
            this.prevBtn.on('click', $.proxy(this.prev, this));
            this.pauseBtn.on('click', $.proxy(this.pause, this));
            this.nextBtn.on('click', $.proxy(this.next, this));
            this.muteBtn.on('click', $.proxy(this.mute, this));
            this.list.find('li').on('click', $.proxy(this.onPlayListClick, this));
            this.volumeInput.on('input change', $.proxy(this.onVolumeChange, this));
            this.seekInput.on('change', $.proxy(this.onCurrentTimeChange, this));
        },
        initDefaults: function () {

            //FIND FIRST AUDIO
            this.initAudio(this.list.find('li:first-child'));
        },
        //INITIALIZATION AUDIO OBJECT && START PLAYING IF AUTOSTART==TRUE
        initAudio: function (element, autoStart) {
            if (this.audio) {
                this.audio.pause();
            }

            var song = element.attr('song'),
                title = element.text(),
                cover = element.attr('cover'),
                artist = element.attr('artist');

            // CREATE AUDIO OBJECT
            this.audio = new Audio('media/' + song);

            if (!this.audio) {
                //Process error
                return;
            }
            $('#audio-player .title').text(title);
            $('#audio-player .artist').text(artist);
            this.list.find('li').removeClass('active');
            element.addClass('active');

            //INSERT COVER IMG
            $('img.cover').attr('src', 'img/covers/' + cover);
            this.durationLbl.html('0.00');
            this.initAudioEvents();
            this.onVolumeChange();

            if (autoStart) {
                this.pauseBtn.hide();
                this.play();
            }
        },
        initAudioEvents: function () {
            //SHOW INFO ONLY IF AUDIO METADATA LOADED
            this.audio.addEventListener('loadedmetadata', $.proxy(function () {
                this.seekInput.attr("max", this.audio.duration);
                var timeData = this.getTimeFormat(this.audio.duration);
                $('#duration-all').html(timeData.min + ':' + timeData.sec);
            }, this));
            $(this.audio).bind('timeupdate', $.proxy(function () {
                //Get minutes and seconds
                var curTime = this.audio.currentTime,
                    timeData = this.getTimeFormat(this.audio.currentTime);
                this.durationLbl.html(timeData.min + ':' + timeData.sec);

                // draw progress bar
                var value = 0;
                if (curTime > 0) {
                    value = (curTime * 100) / this.audio.duration;
                }
                $('#audio-progress').css('width', value + '%');

                this.seekInput.val(curTime);
            }, this));
            $(this.audio).bind('ended', $.proxy(function() {
                this.next();
            }, this));
        },
        //PLAY FUNCTION
        play: function () {
            if (!this.audio) {
                return;
            }
            this.playBtn.hide();
            this.pauseBtn.show();
            this.durationLbl.fadeIn(400);
            this.audio.play();
        },
        //PAUSE FUNCTION
        pause: function () {
            if (!this.audio) {
                return;
            }
            this.audio.pause();
            this.pauseBtn.hide();
            this.playBtn.show();
        },
        //STOP FUNCTION
        stop: function () {
            if (!this.audio) {
                return;
            }
            this.audio.pause();
            this.audio.currentTime = 0;
            this.pauseBtn.hide();
            this.playBtn.show();
            this.durationLbl.fadeOut(400);
        },
        //PLAY NEXT AUDIO - FUNCTION
        next: function () {
            if (!this.audio) {
                return;
            }
            this.stop();
            this.list.find('li.active').next().click();
        },
        //PLAY PREV AUDIO - FUNCTION
        prev: function () {
            if (!this.audio) {
                return;
            }
            this.stop();
            this.list.find('li.active').prev().click();
        },
        setVolume: function (volLevel) {
            if (!this.audio) {
                return;
            }
            this.audio.volume = volLevel;
        },
        //CHANGE AUDIO VOLUME
        onVolumeChange: function () {
            var volumeCount = parseFloat(this.volumeInput.val() / 10);
            // LINK VOLUME INPUT WITH VOLUME MUTE IMG
            if (!volumeCount) {
                this.setVolume(0);
                this.muteBtn.removeClass("unmuted");
                this.muteBtn.addClass("muted");
            } else if (this.muteBtn.hasClass("muted")) {
                this.muteBtn.removeClass("muted");
                this.muteBtn.addClass("unmuted");
            }
            this.setVolume(volumeCount);

        },
        onCurrentTimeChange: function(e) {
            if (!this.audio) {
                return;
            }
            this.audio.currentTime = $(e.currentTarget).val();
        },
        //MUTING AUDIO CAUSES CHANGING CLASS(IMAGE)
        mute: function (e) {
            if (!this.audio) {
                return;
            }
            if (this.muteBtn.hasClass("unmuted")) {
                this.setVolume(0);
                this.volumeInput.val(0);
                this.muteBtn.removeClass("unmuted");
                this.muteBtn.addClass("muted");
            } else if (this.muteBtn.hasClass("muted")) {
                this.setVolume(0.5);
                this.volumeInput.val(0.5);
                this.muteBtn.removeClass("muted");
                this.muteBtn.addClass("unmuted");
            }
        },
        //INITIALIZE NEW AUDIO OBJECT ON CLICKING ON PLAYER LIST
        onPlayListClick: function (e) {
            this.initAudio($(e.currentTarget), true);
        },
        getTimeFormat: function (time) {
            var s = parseInt(time % 60);
            var m = parseInt((time / 60) % 60);
            //Add 0 if seconds or mins less than 10 (01-09 s)
            if (s < 10) {
                s = '0' + s;
            }
            if (m < 10) {
                m = '0' + m;
            }
            return {
                min: m,
                sec: s
            };
        }
    };
    player.initialize();
}());
