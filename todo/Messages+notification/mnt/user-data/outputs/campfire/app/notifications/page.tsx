// app/notifications/page.tsx

const AVATAR_LUNA =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDrLSrGVLArEHAQLyi7JrISeIaDUi8RQVBfVGdfAmqIAwO-WpXxzeRE_UHrQThM1LucD7kCL-yeypWGmy-80v0RShSaeDfSo0uUrzY7wK67V_W-cZH4ASJWZMMhF1R-irrJi_C-l5o87sJEKMzk5cuUhG_A5AqBMKAVfmbkRdPD0SIEuhOWrlzHkLgjEXM39NMilsmGVK7BGDEhIaLAfTDuijtABA6h3EgJPnYyrbettxE3RjYlcHAAdSdVRFJNQuUZIC20C6byZ1ZD';

const AVATAR_KAI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAFEfE1kG-NmloZr3_mvpKatowMSwnJM-iRb7YUwlJIegHysI3KPhrw-aTParI1glTOmMSMagYGi95HrlGX7PZrwDYvHs10wnFf84fAXYqVmUBMJ4uci69yFhtwLIfBNuj-9k3OG8Nx1figKzrWXLy86mlFI-v0MuKpZiI72Qt4fy69SA13bhV7pUHjgIDBCIwjNKn60Q1PUHNk0riki7rg3z8s0dQvPfsBU7GAz74rl6qIehU4w79K0rUjG0VjPVMNlhHQtNQ1oxsF';

const AVATAR_ARIA =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBQLe0bx39hgCDvviXflg187erJTYGhVD7gydV7Qh0vv3UUENTFpSVTeR7d_FDoxPCH3CAiv3QYdreFWEUvYCkzVivRjY4lZklGSUvBxMOUbSzTCl0KsfRd--4YUpwu1nSbt92dsrBxMLsRBjZewkI4B6I3Q38oqCHdRSe0rObqJpYxfgkNoOS_V_jGud92Rv-3Bou93BDVBwVXQw-ZNtHBYXFG34OL8rkPnPt659AntnC0VCoIzSoxLc_-1F8XG19IoNwNzeSPiJAh2';

const AVATAR_ARIA2 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAn2qG9xdSrlGdBi7CAi6nK6BdcpjMMqFR7M24_9-IMxKNFjSvYlzfEoJWs1AJvrQZjVJdb605NCMTzVsr2ZZnyxi-cj-ERu8x_HvlluLZpv31h_lqyPfGyfm2YxTylOo8xJoWHoK8M-vcstX_0Zcq6KFQItLiqL-6xETB943ATYMBJURTkKWDtbEmF0_LGunVJFJ4yXnIEZq3Yn3vl3X8imsVJlOGrB9lsnvrgAHNUTQRW4RurUkrGrU8-N6K9UA7_QUnhcqPFwlXY';

const COVER_LUNA =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCsAX-MxklN7lBPFl8l0PkkBc0f3Rc799F9rVQuyNd3WktLK_7CId5wk_wWqp6UahJ9sz8MFj3JYxjWxHQldhQZSJ2ZjF0q9gkUIZlE4RsJWkuTqixAGdN-zSvBJGiwM_DQRar1f1e1gs_2L_hsn02qlg50I9bHY5FkFKYnA1pdhf8CD30LN7kicb9TwkgLA8yNhFl1r4hOKWCYMmdxp5dNTccgJyakqnJUFYqNa-BuhWRsPxLg-jqq2IPjlWVpxJ_WnMaX57Yhe8Qq';

const COVER_WILD =
  'https://lh3.googleusercontent.com/aida/ADBb0ujmSwf0-Ai0k60yN2fRyRWg5P6mlPQ1dC1hTQztM44_rNKr3xQKUCjiMEJxfCw0DZ28SSh_rZmOhbxGdv6RzE_Y1an4vCx0vn8YstJ_W5biXvRIG0fi-2KaNBv037mDkn9eQv_57VqpTixe0MO_oycV4S3gKd1M3ZJmi7UFyxlAwbNCBd7Es3OWd8gVyr3XatVpOh7MM6dAx1hUfzCoPpbuMdpX2m7QfcWExFV4mKfkUhPnkHsusCNMb5lOqnPn5Jf0Ce9RxCLN0Q';

export default function NotificationsPage() {
  return (
    /* Responsive wrapper — right sidebar occupies 340 px on lg screens */
    <div className="flex max-w-[1440px] mx-auto">

      {/* ── Main content ── */}
      <main className="flex-1 mr-0 lg:mr-[340px] px-6 py-8">
        <div className="max-w-2xl mx-auto">

          {/* Page header */}
          <header className="mb-10">
            <h2 className="font-h1 text-4xl font-bold text-on-surface mb-2">Notifications</h2>
            <div className="flex gap-4 border-b border-orange-100 pb-2">
              <button className="font-label-caps text-primary-orange border-b-2 border-primary-orange pb-2">
                All
              </button>
              <button className="font-label-caps text-stone-400 pb-2 hover:text-stone-600 transition-colors">
                Unread
              </button>
              <button className="font-label-caps text-stone-400 pb-2 hover:text-stone-600 transition-colors">
                Mentions
              </button>
            </div>
          </header>

          <div className="space-y-12">

            {/* ── TODAY ── */}
            <section>
              <h3 className="font-label-caps text-stone-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-accent-pink rounded-full" />
                Today
              </h3>

              <div className="space-y-4">
                {/* Like notification */}
                <div className="glass-border ambient-glow rounded-xl p-4 flex items-start gap-4 hover:-translate-y-0.5 transition-transform cursor-pointer group">
                  <div className="relative shrink-0">
                    <img
                      src={AVATAR_LUNA}
                      alt="Luna_Star"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-primary-orange text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        local_fire_department
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md">
                      <span className="font-username text-on-surface">Luna_Star</span> liked your
                      recent post{' '}
                      <span className="text-primary-orange font-medium">"Morning Rituals"</span>
                    </p>
                    <p className="text-sm text-stone-400 font-label-caps mt-1">2 hours ago</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0">
                    <img
                      src={COVER_LUNA}
                      alt="Morning Rituals"
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>

                {/* Message request */}
                <div className="glass-border ambient-glow rounded-xl p-4 flex items-start gap-4 hover:-translate-y-0.5 transition-transform cursor-pointer">
                  <div className="relative shrink-0">
                    <img
                      src={AVATAR_KAI}
                      alt="Kai_Art"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-accent-pink text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        mail
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md">
                      <span className="font-username text-on-surface">Kai_Art</span> sent you a
                      message request
                    </p>
                    <p className="text-body-md text-stone-500 italic mt-1 leading-snug">
                      "Hey! I really loved your latest concept sketches, would love to..."
                    </p>
                    <p className="text-sm text-stone-400 font-label-caps mt-2">4 hours ago</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── YESTERDAY ── */}
            <section>
              <h3 className="font-label-caps text-stone-400 mb-6">Yesterday</h3>

              <div className="space-y-4">
                {/* Follow notification */}
                <div className="glass-border ambient-glow rounded-xl p-4 flex items-start gap-4 hover:-translate-y-0.5 transition-transform cursor-pointer">
                  <div className="flex -space-x-3 shrink-0">
                    <img
                      src={AVATAR_ARIA}
                      alt="Aria_Cloud"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    />
                    <img
                      src={AVATAR_ARIA2}
                      alt="follower"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md">
                      <span className="font-username text-on-surface">Aria_Cloud</span> and 3 others
                      followed you
                    </p>
                    <p className="text-sm text-stone-400 font-label-caps mt-1">
                      Yesterday at 6:42 PM
                    </p>
                  </div>
                  <button className="px-4 py-1.5 border border-primary-orange text-primary-orange font-label-caps rounded-full hover:bg-orange-50 transition-colors shrink-0">
                    Follow Back
                  </button>
                </div>

                {/* Bento: milestone + event */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Milestone card */}
                  <div className="bg-primary-container p-6 rounded-2xl text-white relative overflow-hidden group col-span-1">
                    <div className="relative z-10">
                      <span
                        className="material-symbols-outlined text-4xl mb-4 block"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        auto_awesome
                      </span>
                      <h4 className="font-h2 text-xl mb-2">New Spark Milestone!</h4>
                      <p className="text-sm opacity-90 font-body-md">
                        Your creative streak has reached 7 days. Keep the fire burning!
                      </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-700">
                      <span className="material-symbols-outlined text-[120px]">
                        local_fire_department
                      </span>
                    </div>
                  </div>

                  {/* Event card */}
                  <div className="glass-border ambient-glow p-6 rounded-2xl flex flex-col justify-between col-span-1">
                    <div>
                      <span className="font-label-caps text-accent-pink mb-1 block">
                        Trending Nearby
                      </span>
                      <h4 className="font-username text-lg">Sketching Session</h4>
                      <p className="text-sm text-stone-500 font-body-md">
                        3 friends are attending today at 4 PM
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex -space-x-2">
                        {['bg-stone-200', 'bg-stone-300', 'bg-stone-400'].map((bg, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 rounded-full ${bg} border-2 border-white`}
                          />
                        ))}
                      </div>
                      <button className="material-symbols-outlined text-primary-orange hover:scale-110 transition-transform">
                        arrow_forward
                      </button>
                    </div>
                  </div>
                </div>

                {/* System notification */}
                <div className="glass-border ambient-glow rounded-xl p-4 flex items-start gap-4 hover:-translate-y-0.5 transition-transform cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                    <span
                      className="material-symbols-outlined text-primary-orange"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      campaign
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md">
                      System: Your account security was successfully updated.
                    </p>
                    <p className="text-sm text-stone-400 font-label-caps mt-1">
                      Yesterday at 11:20 AM
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ── Right sidebar ── */}
      <aside className="hidden lg:block w-[340px] fixed right-0 top-0 h-screen py-8 px-6 border-l border-orange-50 bg-[#FFF8F4] overflow-y-auto">

        {/* Weekly Glow */}
        <div className="mb-8">
          <div className="glass-border ambient-glow rounded-2xl p-5 bg-white">
            <h4 className="font-h2 text-lg mb-4 text-on-surface">Weekly Glow</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500 font-body-md">Interactions</span>
                <span className="font-username text-primary-orange">+128</span>
              </div>
              <div className="h-1.5 w-full bg-orange-50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-orange to-accent-pink w-[75%] rounded-full" />
              </div>
              <p className="text-xs text-stone-400 leading-relaxed font-body-md">
                You&apos;re in the top 5% of creators this week. Keep sharing your spark!
              </p>
            </div>
          </div>
        </div>

        {/* Featured Creator */}
        <div className="mb-8">
          <h4 className="font-label-caps text-stone-400 mb-4 px-2">Featured Creator</h4>
          <div className="rounded-2xl overflow-hidden glass-border ambient-glow bg-white">
            <img
              src={COVER_WILD}
              alt="Wild_Sketcher cover"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-surface-container" />
                <span className="font-username">Wild_Sketcher</span>
              </div>
              <p className="text-xs text-stone-500 mb-4 font-body-md">
                Capturing the silence of the wilderness through digital charcoal.
              </p>
              <button className="w-full py-2 bg-stone-50 text-stone-800 font-label-caps rounded-xl hover:bg-orange-50 transition-colors">
                View Portfolio
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Sparks */}
        <div className="space-y-4">
          <h4 className="font-label-caps text-stone-400 px-2">Suggested Sparks</h4>
          {[
            { name: 'Mochi_Design', role: 'UI/UX Designer' },
            { name: 'Zen_Gardener', role: 'Digital Botanical Artist' },
          ].map(({ name, role }) => (
            <div key={name} className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-surface-container shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-username leading-none">{name}</p>
                <p className="text-xs text-stone-400">{role}</p>
              </div>
              <button className="text-primary-orange font-label-caps shrink-0">Follow</button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
