/* global otCore */
const options = {
  credentials: {
    apiKey: "",  //Replace with your OpenTok API key 
    sessionId: "", //Replace with a generated Session ID
    token: "", //Replace with a generated token (from the dashboard or using an OpenTok server SDK)
  },
   // A container can either be a query selector or an HTMLElement
  streamContainers: function streamContainers(pubSub, type, data) {
    return {
      publisher: {
        camera: '#cameraPublisherContainer',
      },
      subscriber: {
        camera: '#cameraSubscriberContainer',
      },
    }[pubSub][type];
  },
  controlsContainer: '#controls',
  packages: ['textChat'],
  communication: {
    callProperites: null, // Using default
  },
  textChat: {
    name: ['David', 'Paul', 'Emma', 'George', 'Amanda'][Math.random() * 5 | 0], // eslint-disable-line no-bitwise
    waitingMessage: 'Messages will be delivered when other users arrive',
    container: '#chat',
  }
};

/** Application Logic */
const app = () => {
  const state = {
    connected: false,
    active: false,
    publishers: null,
    subscribers: null,
    meta: null,
    localAudioEnabled: true,
    localVideoEnabled: true,
  };

  /**
   * Update the size and position of video containers based on the number of
   * publishers and subscribers specified in the meta property returned by otCore.
   */
  const updateVideoContainers = () => {
    const { meta } = state;
    const activeCameraSubscribers = meta ? meta.subscriber.camera : 0;
   
    const videoContainerClass = `App-video-container ${''}`;
    document.getElementById('appVideoContainer').setAttribute('class', videoContainerClass);

    const cameraPublisherClass =
      `video-container ${!!activeCameraSubscribers? 'small' : ''} ${!!activeCameraSubscribers? 'small' : ''}`;
    document.getElementById('cameraPublisherContainer').setAttribute('class', cameraPublisherClass);

    const cameraSubscriberClass =
      `video-container ${!activeCameraSubscribers ? 'hidden' : ''} active-${activeCameraSubscribers}`;
    document.getElementById('cameraSubscriberContainer').setAttribute('class', cameraSubscriberClass);
  };


  /**
   * Update the UI
   * @param {String} update - 'connected', 'active', or 'meta'
   */
  const updateUI = (update) => {
    const { connected, active } = state;

    switch (update) {
      case 'connected':
        if (connected) {
          document.getElementById('connecting-mask').classList.add('hidden');
          document.getElementById('start-mask').classList.remove('hidden');
        }
        break;
      case 'active':
        if (active) {
          document.getElementById('cameraPublisherContainer').classList.remove('hidden');
          document.getElementById('start-mask').classList.add('hidden');
          document.getElementById('controls').classList.remove('hidden');
        }
        else {
          document.getElementById('start-mask').classList.remove('hidden');
          document.getElementById('controls').classList.add('hidden');
          document.getElementById('cameraPublisherContainer').classList.add('hidden');
          document.getElementById('toggleLocalVideo').classList.remove('muted');
          document.getElementById('toggleLocalAudio').classList.remove('muted');
        }
        break;
      case 'meta':
        updateVideoContainers();
        break;
      default:
        console.log('nothing to do, nowhere to go');
    }
  };

  /**
   * Update the state and UI
   */
  const updateState = (updates) => {
    Object.assign(state, updates);
    Object.keys(updates).forEach(update => updateUI(update));
  };

  /**
   * Start publishing video/audio and subscribe to streams
   */
  const startCall = () => {
    otCore.startCall()
      .then(({ publishers, subscribers, meta }) => {
        updateState({ publishers, subscribers, meta, active: true });
      }).catch(error => console.log(error));
  };

  /**
   * Toggle publishing local audio
   */
  const toggleLocalAudio = () => {
    const enabled = state.localAudioEnabled;
    otCore.toggleLocalAudio(!enabled);
    updateState({ localAudioEnabled: !enabled });
    const action = enabled ? 'add' : 'remove';
    document.getElementById('toggleLocalAudio').classList[action]('muted');
  };

  /**
   * Toggle publishing local video
   */
  const toggleLocalVideo = () => {
    const enabled = state.localVideoEnabled;
    otCore.toggleLocalVideo(!enabled);
    updateState({ localVideoEnabled: !enabled });
    const action = enabled ? 'add' : 'remove';
    document.getElementById('toggleLocalVideo').classList[action]('muted');
  };

  /**
   * Toggle end call
   */
  const toggleEndCall = () => {
    updateState({ active: false });
    otCore.endCall();
  };

  /**
   * Subscribe to otCore and UI events
   */
  const createEventListeners = () => {
    const events = [
      'subscribeToCamera',
      'unsubscribeFromCamera',
    ];
    events.forEach(event => otCore.on(event, ({ publishers, subscribers, meta }) => {
      updateState({ publishers, subscribers, meta });
    }));

    document.getElementById('start').addEventListener('click', startCall);
    document.getElementById('toggleLocalAudio').addEventListener('click', toggleLocalAudio);
    document.getElementById('toggleLocalVideo').addEventListener('click', toggleLocalVideo);
    document.getElementById('toggleEndCall').addEventListener('click', toggleEndCall);
  };

  /**
   * Initialize otCore, connect to the session, and listen to events
   */
  const init = () => {
    otCore.init(options);
    otCore.connect().then(() => updateState({ connected: true }));
    createEventListeners();
  };

  init();
};

document.addEventListener('DOMContentLoaded', app);
