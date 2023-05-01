import { Twitch_State } from "@/server/services/twitch/schema";
import { FC } from "react";
import { SiTwitch } from "react-icons/si";
import { useSnapshot } from "valtio";
import Tooltip from "../dropdown/Tooltip";
import Inspector from "./components";
import { InputCheckbox, InputMapObject, InputNetworkStatus, InputTextSource } from "./components/input";
import NiceModal from "@ebay/nice-modal-react";
import Modal from "../Modal";

const EmotesInspector: FC = () => {
  return <>
    <Inspector.SubHeader>Emotes ({Object.keys(window.ApiServer.twitch.emotes.dictionary).length})</Inspector.SubHeader>
    <div className="grid grid-cols-8 gap-1">
      {Object.keys(window.ApiServer.twitch.emotes).map((k, i) =>
        <Tooltip key={k} className="relative aspect-square" placement="top" content={k}>
          <img className="w-full h-full aspect-square object-contain" src={window.ApiServer.twitch.emotes.dictionary[k]} />
        </Tooltip>
      )
      }
    </div>
  </>
}

const EmotesModal: FC = () => {
  return (
    <Modal.Body width={420}>
      <Modal.Header>Emotes</Modal.Header>
      <Modal.Content>
        <div className="p-4 flex flex-col space-y-2">
          <div className="grid grid-cols-12 gap-1">
            {Object.keys(window.ApiServer.twitch.emotes.dictionary).map((k, i) => (
              <Tooltip key={k} className="relative aspect-square" placement="top" content={k}>
                <img className="w-full h-full aspect-square object-contain" src={window.ApiServer.twitch.emotes.dictionary[k]}/>
              </Tooltip>
            ))}
          </div>
        </div>
      </Modal.Content>
    </Modal.Body>
  );
}
NiceModal.register('twitch-emotes', (props) => <Modal.Base {...props}><EmotesModal /></Modal.Base>);
const EmotesMapModal: FC = () => {
  const pr = useSnapshot(window.ApiServer.state.services.twitch.data);
  const up = <K extends keyof Twitch_State>(key: K, v: Twitch_State[K]) => window.ApiServer.patchService("twitch", s => s.data[key] = v);
  return (
    <Modal.Body width={420}>
      <Modal.Header>Remap Emotes</Modal.Header>
      <Modal.Content>
        <div className="p-4">
          <InputMapObject keyPlaceholder="Word" valuePlaceholder="Emote" value={{...pr.emotesReplacements}} onChange={e => up("emotesReplacements", e)} label="" />
        </div>
      </Modal.Content>
    </Modal.Body>
  );
}
NiceModal.register('twitch-emotes-map', (props) => <Modal.Base {...props}><EmotesMapModal /></Modal.Base>);

const Inspector_Twitch: FC = () => {
  const {user, liveStatus} = useSnapshot(window.ApiServer.twitch.state);
  const chatState = useSnapshot(window.ApiServer.twitch.chat.state);
  const handleLogin = () => window.ApiServer.twitch.login();
  const handleLogout = () => window.ApiServer.twitch.logout();
  const handleShowEmotes = () => NiceModal.show('twitch-emotes');
  const handleShowEmotesMapper = () => NiceModal.show('twitch-emotes-map');
  const pr = useSnapshot(window.ApiServer.state.services.twitch.data);
  const up = <K extends keyof Twitch_State>(key: K, v: Twitch_State[K]) => window.ApiServer.patchService("twitch", s => s.data[key] = v);
  return <Inspector.Body>
    <Inspector.Header><SiTwitch/> Twitch</Inspector.Header>
    <Inspector.Content>
      {user && <div className="flex items-center space-x-4">
        <img className="rounded-full aspect-square w-10 ring-2 ring-success ring-offset-base-100 ring-offset-2" src={user.profilePictureUrl} />
        <div className="flex flex-col">
          <div className="font-semibold">{user.name}</div>
          <div className="text-xs link link-warning link-hover font-medium" onClick={handleLogout}>Logout</div>
        </div>
      </div>}

      {!user && <button className="btn gap-2 border-none" style={{backgroundColor: "#9147ff", color: "#fff"}} onClick={handleLogin}><SiTwitch size={20}/> Login</button>}
      <Inspector.Switchable visible={!!user}>
        <InputNetworkStatus label="Stream" connectedLabel="Live" disconnectedLabel="Offline" value={liveStatus} />
        <InputNetworkStatus label="Chat" value={chatState.connection} />
        <InputCheckbox label="Enable chat" value={pr.chatEnable} onChange={e => up("chatEnable", e)} />
        <Inspector.Switchable visible={pr.chatEnable}>
          <InputCheckbox label="Post in chat" value={pr.chatPostEnable} onChange={e => up("chatPostEnable", e)} />
          <Inspector.Description>Post speech to text or translation results in chat</Inspector.Description>
          <InputCheckbox label="Post only when live streaming" value={pr.chatPostLive} onChange={e => up("chatPostLive", e)} />
          <InputTextSource label="Post from" value={pr.chatPostSource} onChange={e => up("chatPostSource", e)} />
          <InputCheckbox label="Post from text field" value={pr.chatPostInput} onChange={e => up("chatPostInput", e)} />
          <InputCheckbox label="Post from chat" value={pr.chatReceiveEnable} onChange={e => up("chatReceiveEnable", e)} />
          <Inspector.Description>Chat as a text field</Inspector.Description>
        </Inspector.Switchable>
        <Inspector.SubHeader>Emotes</Inspector.SubHeader>
        <span>
          <span className="link link-accent link-hover font-semibold text-xs" onClick={handleShowEmotes}>Show emotes</span> | <span className="link link-accent link-hover font-semibold text-xs" onClick={handleShowEmotesMapper}>Remap emotes</span>
        </span>
        <InputCheckbox label="Enable emotes in captions" value={pr.emotesEnableReplacements} onChange={e => up("emotesEnableReplacements", e)} />
      </Inspector.Switchable>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Twitch;
