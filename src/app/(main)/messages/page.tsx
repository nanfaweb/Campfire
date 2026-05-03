// app/messages/page.tsx
import Image from 'next/image';

/* ── Static data ── */
const conversations = [
  {
    id: 1,
    name: 'Haru Tanaka',
    preview: 'Did you see the new fire sparks today? 🔥',
    time: '2M AGO',
    online: true,
    active: true,
    avatar: 'https://lh3.googleusercontent.com/aida/ADBb0ujmSwf0-Ai0k60yN2fRyRWg5P6mlPQ1dC1hTQztM44_rNKr3xQKUCjiMEJxfCw0DZ28SSh_rZmOhbxGdv6RzE_Y1an4vCx0vn8YstJ_W5biXvRIG0fi-2KaNBv037mDkn9eQv_57VqpTixe0MO_oycV4S3gKd1M3ZJmi7UFyxlAwbNCBd7Es3OWd8gVyr3XatVpOh7MM6dAx1hUfzCoPpbuMdpX2m7QfcWExFV4mKfkUhPnkHsusCNMb5lOqnPn5Jf0Ce9RxCLN0Q',
  },
  {
    id: 2,
    name: 'Mina_Art',
    preview: 'That sketch looks amazing! Keep it up...',
    time: '1H AGO',
    online: false,
    active: false,
    avatar: null,
    initials: null,
    iconFallback: true,
  },
  {
    id: 3,
    name: 'Kaito_Kun',
    preview: "Let's meet up at the campfire tonight.",
    time: 'YESTERDAY',
    online: false,
    active: false,
    avatar: null,
    initials: 'K',
    bgColor: 'bg-secondary-fixed',
    textColor: 'text-secondary',
  },
  {
    id: 4,
    name: 'Aya_Breath',
    preview: "I'm so excited for the next chapter!",
    time: 'OCT 12',
    online: false,
    active: false,
    avatar: null,
    initials: 'A',
    bgColor: 'bg-tertiary-fixed',
    textColor: 'text-tertiary',
  },
];

const AVATAR_URL =
  'https://lh3.googleusercontent.com/aida/ADBb0ujmSwf0-Ai0k60yN2fRyRWg5P6mlPQ1dC1hTQztM44_rNKr3xQKUCjiMEJxfCw0DZ28SSh_rZmOhbxGdv6RzE_Y1an4vCx0vn8YstJ_W5biXvRIG0fi-2KaNBv037mDkn9eQv_57VqpTixe0MO_oycV4S3gKd1M3ZJmi7UFyxlAwbNCBd7Es3OWd8gVyr3XatVpOh7MM6dAx1hUfzCoPpbuMdpX2m7QfcWExFV4mKfkUhPnkHsusCNMb5lOqnPn5Jf0Ce9RxCLN0Q';

export default function MessagesPage() {
  return (
    <main className="ml-64 flex-1 h-screen flex flex-col overflow-hidden bg-white">
      {/* ── Page Header ── */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-orange-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <h2 className="font-h2 text-2xl text-primary">Messages</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined text-outline absolute left-3 top-1/2 -translate-y-1/2 text-lg">
              search
            </span>
            <input
              className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary-orange w-64 transition-all"
              placeholder="Search chats..."
              type="text"
            />
          </div>
          <button className="p-2 text-outline hover:text-primary-container transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* ── Split View ── */}
      <div className="flex flex-grow overflow-hidden">

        {/* ── Conversation List ── */}
        <aside className="w-96 border-r border-orange-50 bg-white flex flex-col">
          {/* Tabs */}
          <div className="flex p-4 gap-2 border-b border-orange-50">
            <button className="flex-1 py-2 text-xs font-label-caps uppercase tracking-widest bg-orange-50 text-primary-container rounded-lg font-bold">
              Friends
            </button>
            <button className="flex-1 py-2 text-xs font-label-caps uppercase tracking-widest text-stone-400 hover:text-primary-container transition-colors">
              Requests
            </button>
          </div>

          {/* List */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-1">
            {conversations.map((c) => (
              <div
                key={c.id}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                  c.active
                    ? 'bg-orange-50/50 border border-orange-100/50'
                    : 'hover:bg-surface-container-low'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {c.avatar ? (
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary-orange shadow-sm"
                    />
                  ) : c.iconFallback ? (
                    <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary-container">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full ${c.bgColor} flex items-center justify-center ${c.textColor} font-h2 font-bold`}
                    >
                      {c.initials}
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                      c.online ? 'bg-green-500' : 'bg-stone-300'
                    }`}
                  />
                </div>

                {/* Meta */}
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-username text-on-surface truncate">{c.name}</h4>
                    <span className="text-[10px] text-stone-400 font-label-caps shrink-0 ml-2">
                      {c.time}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      c.active ? 'text-primary font-medium' : 'text-stone-400'
                    }`}
                  >
                    {c.preview}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Chat Window ── */}
        <section className="flex-grow flex flex-col bg-surface">
          {/* Chat header */}
          <header className="px-6 py-4 bg-white border-b border-orange-50 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={AVATAR_URL}
                  alt="Haru Tanaka"
                  className="w-10 h-10 rounded-full object-cover border border-orange-100"
                />
              </div>
              <div>
                <h3 className="font-username text-on-surface leading-none">Haru Tanaka</h3>
                <span className="text-green-600 text-xs font-medium flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Online now
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {['call', 'videocam', 'info'].map((icon) => (
                <button
                  key={icon}
                  className="p-2 text-stone-400 hover:text-primary-orange hover:bg-orange-50 rounded-full transition-all"
                >
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
            </div>
          </header>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-8 space-y-8">
            {/* Date divider */}
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-surface-container-highest/30 text-[10px] font-label-caps text-stone-500 rounded-full tracking-widest">
                TODAY, OCT 14
              </span>
            </div>

            {/* Received */}
            <div className="flex items-end gap-3 max-w-2xl">
              <img
                src={AVATAR_URL}
                alt="Haru Tanaka"
                className="w-8 h-8 rounded-full object-cover border border-orange-50 mb-1 shrink-0"
              />
              <div className="flex flex-col gap-1 items-start">
                <div className="bg-white border border-orange-100 p-4 rounded-2xl rounded-bl-none shadow-[0_2px_15px_-3px_rgba(168,57,0,0.05)]">
                  <p className="text-on-surface text-body-md">
                    Hey! Did you finish that new character design? I&apos;ve been waiting to see how
                    you handled the flame effects! ✨
                  </p>
                </div>
                <span className="text-[10px] text-stone-400 font-label-caps ml-2">10:42 AM</span>
              </div>
            </div>

            {/* Sent */}
            <div className="flex flex-col items-end gap-1">
              <div className="bg-primary-container text-white p-4 rounded-2xl rounded-br-none shadow-lg shadow-primary-container/10 max-w-xl">
                <p className="text-body-md">
                  Almost done! The sparks were a bit tricky to get right, but I followed that
                  tutorial you shared. It&apos;s looking much cozier now.
                </p>
              </div>
              <div className="flex items-center gap-1 mr-2">
                <span className="text-[10px] text-stone-400 font-label-caps">10:45 AM</span>
                <span
                  className="material-symbols-outlined text-xs text-primary-orange"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  done_all
                </span>
              </div>
            </div>

            {/* Received with image attachment */}
            <div className="flex items-end gap-3 max-w-2xl">
              <img
                src={AVATAR_URL}
                alt="Haru Tanaka"
                className="w-8 h-8 rounded-full object-cover border border-orange-50 mb-1 shrink-0"
              />
              <div className="flex flex-col gap-1 items-start">
                <div className="bg-white border border-orange-100 p-4 rounded-2xl rounded-bl-none shadow-[0_2px_15px_-3px_rgba(168,57,0,0.05)]">
                  <p className="text-on-surface text-body-md">
                    Did you see the new fire sparks today? 🔥 They just released the update!
                  </p>
                </div>
                {/* Image attachment */}
                <div className="mt-2 bg-white border border-orange-100 p-2 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:border-primary-orange/30 transition-colors group">
                  <div className="w-64 h-40 rounded-lg bg-orange-100 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary-orange/20 to-accent-pink/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-primary-container/30">
                        image
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] font-label-caps text-stone-400 mt-2 px-1">
                    NEW_ASSET_PACK.PNG
                  </p>
                </div>
                <span className="text-[10px] text-stone-400 font-label-caps ml-2">10:46 AM</span>
              </div>
            </div>
          </div>

          {/* Input area */}
          <footer className="p-6 bg-white border-t border-orange-50">
            <div className="max-w-4xl mx-auto flex items-end gap-3">
              <div className="flex items-center gap-1 pb-1">
                {['add', 'mood'].map((icon) => (
                  <button
                    key={icon}
                    className="p-2 text-stone-400 hover:text-primary-orange hover:bg-orange-50 rounded-xl transition-all"
                  >
                    <span className="material-symbols-outlined">{icon}</span>
                  </button>
                ))}
              </div>

              <div className="flex-grow relative">
                <textarea
                  className="w-full bg-surface-container-low border-none rounded-2xl px-4 py-3 text-body-md focus:ring-1 focus:ring-primary-orange/50 resize-none max-h-32 custom-scrollbar transition-all"
                  placeholder="Write a message..."
                  rows={1}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button className="p-1 text-stone-300 hover:text-primary-orange transition-colors">
                    <span className="material-symbols-outlined text-lg">mic</span>
                  </button>
                </div>
              </div>

              <button className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-secondary active:scale-90 transition-all duration-200">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>

            <div className="text-center mt-3">
              <p className="text-[10px] text-stone-300 font-label-caps tracking-widest">
                MESSAGES ARE END-TO-END WARMED
              </p>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
