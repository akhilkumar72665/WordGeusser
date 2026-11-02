import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Target,
  Sparkles,
  Trophy,
  BookOpen,
  Layers,
  Compass,
  Film,
  Utensils,
  Cpu
} from 'lucide-react';

export const HowToPlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="how-to-play-section page-shell" aria-labelledby="rules-title">
      <div className="panel how-to-play-panel">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="how-to-play-toggle"
          aria-expanded={isOpen}
          aria-controls="how-to-play-content"
        >
          <div className="how-to-play-head">
            <span className="badge badge-forest">
              <HelpCircle className="w-3.5 h-3.5 mr-1 inline" />
              Game Guide
            </span>
            <h2 id="rules-title" className="how-to-play-heading">
              How to Play Wordguesser (Game Rules &amp; Categories)
            </h2>
          </div>
          <span className="toggle-indicator">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        </button>

        {isOpen && (
          <div id="how-to-play-content" className="how-to-play-body">
            {/* 4 Step Gameplay Walkthrough */}
            <div className="rules-grid">
              <div className="rule-card">
                <div className="rule-step">1</div>
                <div className="rule-icon"><Shield className="w-5 h-5 text-emerald-400" /></div>
                <h3>Conceal Your Secret Word</h3>
                <p>
                  Every player seals one word of the table&apos;s chosen length (3 to 10 letters).
                  Choose from English vocabulary, pop culture, cricket, geography, or lock in a unique <strong>Custom Word</strong>.
                </p>
              </div>

              <div className="rule-card">
                <div className="rule-step">2</div>
                <div className="rule-icon"><Target className="w-5 h-5 text-indigo-400" /></div>
                <h3>The Deduction Ring</h3>
                <p>
                  Players are organized in a closed ring: each player hunts an assigned quarry.
                  On your turn, probe your rival by testing one letter (A&ndash;Z).
                </p>
              </div>

              <div className="rule-card">
                <div className="rule-step">3</div>
                <div className="rule-icon"><Sparkles className="w-5 h-5 text-amber-400" /></div>
                <h3>Ask Letters &amp; Reveal Positions</h3>
                <p>
                  If your tested letter exists in your target&apos;s word, its exact position(s) light up!
                  If it misses, the miss is recorded. In both cases, the turn passes.
                </p>
              </div>

              <div className="rule-card">
                <div className="rule-step">4</div>
                <div className="rule-icon"><Trophy className="w-5 h-5 text-rose-400" /></div>
                <h3>Name the Word &amp; Ring Shift</h3>
                <p>
                  When confident, guess their full secret word. Correct guess eliminates them (+score bonus) and your target shifts to who they were hunting! Wrong guess costs 5 pts &amp; 1 attempt.
                </p>
              </div>
            </div>

            {/* Authoritative Table Rules */}
            <div className="rules-details-box mt-6">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Table Rules &amp; Scoring Summary
              </h3>
              <ul className="rules-list">
                <li>
                  <strong>Scoring:</strong> Correct word guess awards 10 to 50 base points (based on difficulty) plus a +15 first-attempt bonus. Surviving winner receives a +20 survival victory bonus.
                </li>
                <li>
                  <strong>Wrong Guesses:</strong> Guessing an incorrect word penalizes you 5 points and expends 1 word guess attempt.
                </li>
                <li>
                  <strong>Ring Auto-Reassignment:</strong> When any player is eliminated or leaves, the ring closes smoothly around them and their hunter immediately inherits their former target.
                </li>
                <li>
                  <strong>Timeout Outcome:</strong> If turn clock is enabled and expires, turn automatically passes to keep the match moving.
                </li>
                <li>
                  <strong>Custom Words:</strong> You can enter any valid English word, Indian place, movie, personality, or toggle <em>Custom Word</em> to lock in your own special secret word.
                </li>
              </ul>
            </div>

            {/* Complete Word Categories Grid */}
            <div className="categories-box mt-6">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Supported Word Categories
              </h3>
              <div className="categories-grid">
                <div className="category-pill">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <div>
                    <strong>English Dictionary</strong>
                    <span>274,000+ words, common, advanced &amp; slang</span>
                  </div>
                </div>

                <div className="category-pill">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <div>
                    <strong>Places &amp; Geography</strong>
                    <span>Countries, world capitals, Indian cities, rivers &amp; states</span>
                  </div>
                </div>

                <div className="category-pill">
                  <Film className="w-4 h-4 text-purple-400" />
                  <div>
                    <strong>Movies &amp; Personalities</strong>
                    <span>Bollywood, Hollywood, Cricket stars, Anime &amp; History</span>
                  </div>
                </div>

                <div className="category-pill">
                  <Utensils className="w-4 h-4 text-amber-400" />
                  <div>
                    <strong>Food &amp; Indian Culture</strong>
                    <span>Dishes, sweets, street food, festivals, mythology &amp; Hinglish</span>
                  </div>
                </div>

                <div className="category-pill">
                  <Trophy className="w-4 h-4 text-rose-400" />
                  <div>
                    <strong>Sports &amp; Games</strong>
                    <span>Cricket, IPL teams, Football, Chess &amp; Video games</span>
                  </div>
                </div>

                <div className="category-pill">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <div>
                    <strong>Science &amp; Brands</strong>
                    <span>Tech brands, Automakers, Coding terms &amp; Astronomy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
