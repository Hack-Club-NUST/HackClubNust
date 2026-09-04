import type { Sample } from '../types';

/**
 * Curated exemplars, not scraped provenance.
 *
 * Every sample here was written for this game to demonstrate a specific stylistic
 * tell — the "AI" ones imitate the habits of instruction-tuned models (hedging,
 * tricolons, symmetric clauses, comments that restate code), the "human" ones
 * carry the things models rarely produce: unexplained context, dead-end tangents,
 * local specifics, and mistakes nobody bothered to fix.
 *
 * Treat the labels as "which register is this written in", not as forensic truth.
 * To grow the bank, just append — drawRun() balances AI/human automatically.
 */
export const SAMPLES: Sample[] = [
  /* ------------------------------- text · AI ------------------------------- */
  {
    id: 't-ai-1',
    kind: 'text',
    difficulty: 'easy',
    isAI: true,
    content:
      "In today's fast-paced digital landscape, learning to code has become more important than ever. Whether you are a student, a working professional, or simply a curious mind, programming offers a powerful way to solve problems, express creativity, and build a brighter future. By embracing this journey, you open the door to endless possibilities.",
    tell: 'Opens with "In today\'s fast-paced", stacks a three-item list, and closes on a sentence that says nothing. Three model habits in one paragraph.',
  },
  {
    id: 't-ai-2',
    kind: 'text',
    difficulty: 'easy',
    isAI: true,
    content:
      "A good hackathon is not just about writing code — it is about building community. It is not merely a competition; it is a celebration of curiosity. And it is not simply a weekend event; it is the beginning of something much larger.",
    tell: 'The "not just X, it is Y" construction three times in a row. Models reach for that inversion constantly; people use it once and move on.',
  },
  {
    id: 't-ai-3',
    kind: 'text',
    difficulty: 'medium',
    isAI: true,
    content:
      "It is important to note that both approaches have their own advantages and disadvantages. While the first offers greater flexibility, the second provides improved consistency. Ultimately, the right choice depends on your specific needs and circumstances, and it is worth carefully considering the trade-offs before making a decision.",
    tell: 'Perfectly balanced both-sides answer that refuses to recommend anything. "It is important to note" plus "ultimately, it depends" is a hedge sandwich.',
  },
  {
    id: 't-ai-4',
    kind: 'text',
    difficulty: 'medium',
    isAI: true,
    content:
      "Great question! Setting up your development environment can definitely feel overwhelming at first. Here is a simple breakdown to help you get started:\n\n1. Install a code editor\n2. Set up version control\n3. Configure your terminal\n\nOnce you have these in place, you will be well on your way. Hope this helps!",
    tell: 'The "Great question!" opener, an unrequested numbered list, and "Hope this helps!" — assistant register, not forum register.',
  },
  {
    id: 't-ai-5',
    kind: 'text',
    difficulty: 'hard',
    isAI: true,
    content:
      "The first year taught me patience. The second year taught me precision. The third year taught me that neither matters much without people who will read your code at two in the morning and tell you honestly that it is wrong.",
    tell: 'Reads well, but the escalating parallel triplet resolving into a warm closing line is a shape models fall into. Note there is no actual person, project, or place in it.',
  },
  {
    id: 't-ai-6',
    kind: 'text',
    difficulty: 'hard',
    isAI: true,
    content:
      "I spent about six months working on a project that ultimately failed. Looking back, I learned a great deal from the experience. The technical challenges were significant, but the real difficulty was communication within the team. It was a humbling lesson, and one I carry with me to this day.",
    tell: 'A memoir with no memory in it — round numbers, no names, no dates, no detail anyone could check. Real anecdotes leak specifics.',
  },

  /* ------------------------------ text · human ----------------------------- */
  {
    id: 't-hu-1',
    kind: 'text',
    difficulty: 'easy',
    isAI: false,
    content:
      "wifi in the lab died again at like 2am, third time this week. tried the usual (forget network, reconnect, cry) and nothing. ended up tethering off my phone and burned 4gb pushing one docker image. if anyone from IT is reading this pls just reboot the AP in the corner, it's the one with the sticker on it",
    tell: 'Lowercase, a parenthetical joke inside a list, an oddly exact 4GB, and a physical detail (the sticker) nobody would invent.',
  },
  {
    id: 't-hu-2',
    kind: 'text',
    difficulty: 'easy',
    isAI: false,
    content:
      "honestly? just use postgres. i know that's boring. every time i've picked something clever for a side project i've spent the next month reading migration docs instead of building the thing.",
    tell: 'Takes an actual position, admits it is boring, and backs it with a lived complaint. Models hedge; people recommend.',
  },
  {
    id: 't-hu-3',
    kind: 'text',
    difficulty: 'medium',
    isAI: false,
    content:
      "We did the demo in H-12 and the projector cut out twice — turned out someone had the HDMI half in. Anyway the judges liked the leaderboard more than the actual model, which was annoying because Bilal wrote the leaderboard in like forty minutes the night before. I still think our feature extraction was the interesting part but nobody asked about it.",
    tell: 'Named person, a specific place, a grudge that never resolves, and a tangent that trails off. Models tie their anecdotes into a lesson.',
  },
  {
    id: 't-hu-4',
    kind: 'text',
    difficulty: 'medium',
    isAI: false,
    content:
      "quick note before i forget: the staging creds rotated on friday so if you're getting 401s that's why, not your branch. also the seed script is broken but only on arm macs?? works fine on the CI box. i'll look at it monday unless someone beats me to it",
    tell: 'Written to a reader who already has the context, with an unresolved bug and a shrug. The double question mark is not a register models write in.',
  },
  {
    id: 't-hu-5',
    kind: 'text',
    difficulty: 'hard',
    isAI: false,
    content:
      "I used to think debugging was about being clever. It isn't. It's mostly about being willing to be bored — to read the same forty lines a fourth time when you are certain the bug is somewhere more interesting. The bug is never somewhere more interesting. It is in the forty lines, and it has been there the whole time, wearing your own handwriting.",
    tell: 'Polished, but the closing image is strange and specific in a way that is hard to fake, and it argues against the reader rather than flattering them.',
  },
  {
    id: 't-hu-6',
    kind: 'text',
    difficulty: 'hard',
    isAI: false,
    content:
      "Ran the numbers again after Ammar pointed out I was double-counting weekend signups. Corrected figures: 312 total, not 400ish like I said in the meeting. Sorry about that. Doesn't change the conclusion but it does make the growth curve a lot less exciting and I'd rather we know now than in front of the faculty advisor.",
    tell: 'A correction of the writer\'s own earlier claim, with a precise number replacing a vague one. Models rarely retract themselves mid-note.',
  },

  /* ------------------------------- code · AI ------------------------------- */
  {
    id: 'c-ai-1',
    kind: 'code',
    lang: 'python',
    difficulty: 'easy',
    isAI: true,
    content:
      'def calculate_average(numbers):\n    """\n    Calculate the average of a list of numbers.\n\n    Args:\n        numbers (list): A list of numeric values.\n\n    Returns:\n        float: The average of the input numbers.\n\n    Raises:\n        ValueError: If the input list is empty.\n\n    Example:\n        >>> calculate_average([1, 2, 3])\n        2.0\n    """\n    if not numbers:\n        raise ValueError("The input list cannot be empty.")\n\n    # Calculate the sum of all numbers\n    total = sum(numbers)\n\n    # Divide by the count to get the average\n    return total / len(numbers)',
    tell: 'A twelve-line docstring with an Example block on a two-line function, plus comments that restate the code underneath them.',
  },
  {
    id: 'c-ai-2',
    kind: 'code',
    lang: 'javascript',
    difficulty: 'easy',
    isAI: true,
    content:
      'function fetchUserData(userId) {\n  // Validate the input parameter\n  if (!userId) {\n    console.error("Error: userId is required");\n    return null;\n  }\n\n  try {\n    // Attempt to fetch the user data from the API\n    const response = fetch(`/api/users/${userId}`);\n    return response;\n  } catch (error) {\n    // Handle any errors that may occur\n    console.error("An error occurred while fetching user data:", error);\n    return null;\n  }\n}',
    tell: 'Ceremonial try/catch around a call that cannot throw synchronously, and a comment above every single block explaining the obvious.',
  },
  {
    id: 'c-ai-3',
    kind: 'code',
    lang: 'typescript',
    difficulty: 'medium',
    isAI: true,
    content:
      'export function isValidEmailAddress(emailAddress: string): boolean {\n  // Check if the email address is null, undefined, or empty\n  if (!emailAddress || emailAddress.trim().length === 0) {\n    return false;\n  }\n\n  // Define the regular expression pattern for email validation\n  const emailRegularExpressionPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n\n  // Test the email address against the pattern and return the result\n  return emailRegularExpressionPattern.test(emailAddress);\n}',
    tell: 'emailRegularExpressionPattern. Nobody types that twice. Model naming inflates identifiers to full English phrases.',
  },
  {
    id: 'c-ai-4',
    kind: 'code',
    lang: 'python',
    difficulty: 'medium',
    isAI: true,
    content:
      'class UserManager:\n    """A class to manage user operations."""\n\n    def __init__(self):\n        """Initialize the UserManager with an empty user dictionary."""\n        self.users = {}\n\n    def add_user(self, user_id, user_name):\n        """Add a new user to the manager."""\n        if user_id in self.users:\n            print("User already exists.")\n            return False\n        self.users[user_id] = user_name\n        return True\n\n    def remove_user(self, user_id):\n        """Remove an existing user from the manager."""\n        if user_id not in self.users:\n            print("User does not exist.")\n            return False\n        del self.users[user_id]\n        return True',
    tell: 'Textbook symmetry: every method mirrors its opposite, each with a one-line docstring, printing instead of raising. This is a tutorial, not a codebase.',
  },
  {
    id: 'c-ai-5',
    kind: 'code',
    lang: 'typescript',
    difficulty: 'hard',
    isAI: true,
    content:
      'export async function retryWithBackoff<T>(\n  operation: () => Promise<T>,\n  maxRetries: number = 3,\n  initialDelayMs: number = 1000\n): Promise<T> {\n  let lastError: Error | undefined;\n\n  for (let attempt = 0; attempt < maxRetries; attempt++) {\n    try {\n      return await operation();\n    } catch (error) {\n      lastError = error as Error;\n      const delayMs = initialDelayMs * Math.pow(2, attempt);\n      await new Promise((resolve) => setTimeout(resolve, delayMs));\n    }\n  }\n\n  throw lastError ?? new Error("Operation failed after maximum retries");\n}',
    tell: 'Genuinely competent, which is the point — but it is the canonical textbook retry: every parameter defaulted, no jitter, no abort signal, no logging. Real retry helpers carry scars.',
  },
  {
    id: 'c-ai-6',
    kind: 'code',
    lang: 'javascript',
    difficulty: 'hard',
    isAI: true,
    content:
      'const debounce = (func, delay) => {\n  let timeoutId;\n\n  return (...args) => {\n    // Clear the previous timeout if it exists\n    if (timeoutId) {\n      clearTimeout(timeoutId);\n    }\n\n    // Set a new timeout to call the function after the delay\n    timeoutId = setTimeout(() => {\n      func(...args);\n    }, delay);\n  };\n};',
    tell: 'Correct and clean, but every branch is narrated by a comment and the guard around clearTimeout is unnecessary — clearTimeout(undefined) is a no-op. Defensive noise.',
  },

  /* ------------------------------ code · human ----------------------------- */
  {
    id: 'c-hu-1',
    kind: 'code',
    lang: 'python',
    difficulty: 'easy',
    isAI: false,
    content:
      'def parse(line):\n    # log format changed in march, old lines have 5 fields not 6\n    parts = line.split("|")\n    if len(parts) == 5:\n        parts.insert(3, "")\n    ts, lvl, mod, _, msg, rest = parts\n    return ts.strip(), lvl.strip(), msg.strip()\n\n\n# TODO drop this once the march backfill is done',
    tell: 'A dated, load-bearing comment about a real migration, an unused variable nobody cleaned up, and a TODO tied to actual work.',
  },
  {
    id: 'c-hu-2',
    kind: 'code',
    lang: 'javascript',
    difficulty: 'easy',
    isAI: false,
    content:
      'function fmt(n) {\n  if (n < 1000) return String(n);\n  if (n < 1e6) return (n / 1000).toFixed(1) + "k";\n  return (n / 1e6).toFixed(1) + "M";\n}\n\n// yes 1000 -> "1.0k" looks bad. design said ship it.',
    tell: 'Terse names, no docstring, and a comment blaming a design decision. Models do not throw a colleague under the bus in a code comment.',
  },
  {
    id: 'c-hu-3',
    kind: 'code',
    lang: 'typescript',
    difficulty: 'medium',
    isAI: false,
    content:
      'export function useStableCallback<T extends (...a: any[]) => any>(fn: T) {\n  const ref = useRef(fn);\n  ref.current = fn; // intentionally not in an effect, we want it sync for the\n                    // paint that follows a state change. do not "fix" this.\n  return useCallback((...a: Parameters<T>) => ref.current(...a), []) as T;\n}',
    tell: 'A comment defending an unusual choice against a future reviewer, wrapped mid-sentence across lines. That is an argument someone already had.',
  },
  {
    id: 'c-hu-4',
    kind: 'code',
    lang: 'python',
    difficulty: 'medium',
    isAI: false,
    content:
      'def send(msg, retries=2):\n    for i in range(retries + 1):\n        try:\n            return _post(msg)\n        except (Timeout, ConnectionError):\n            if i == retries:\n                raise\n            time.sleep(0.4 * (i + 1))\n        except RateLimited as e:\n            time.sleep(e.retry_after + 0.5)  # +0.5 because their header lies\n            return _post(msg)',
    tell: 'Catches two specific exception types differently, and the "+0.5 because their header lies" is a bug someone got burned by at 3am.',
  },
  {
    id: 'c-hu-5',
    kind: 'code',
    lang: 'javascript',
    difficulty: 'hard',
    isAI: false,
    content:
      'const seen = new Set();\n\nexport function track(ev, props) {\n  const key = ev + JSON.stringify(props);\n  if (seen.has(key)) return;\n  seen.add(key);\n  if (seen.size > 500) seen.clear(); // crude but the page reloads often enough\n  queue.push({ ev, props, t: Date.now() });\n}',
    tell: 'An admitted crude fix with a justification based on how the app actually gets used. Models write LRU caches; people write seen.clear().',
  },
  {
    id: 'c-hu-6',
    kind: 'code',
    lang: 'typescript',
    difficulty: 'hard',
    isAI: false,
    content:
      'type Ok<T> = { ok: true; value: T };\ntype Err = { ok: false; error: string };\nexport type Result<T> = Ok<T> | Err;\n\nexport const ok = <T,>(value: T): Ok<T> => ({ ok: true, value });\nexport const err = (error: string): Err => ({ ok: false, error });\n\n// the trailing comma in <T,> is for the .tsx parser, not a typo',
    tell: 'The final comment exists only because a teammate flagged it in review. It defends a real syntax quirk rather than explaining what the code does.',
  },
  /* ----------------------------- text · traps ------------------------------ */
  {
    id: 't-ai-7',
    kind: 'text',
    difficulty: 'hard',
    isAI: true,
    content:
      "ngl the first version was kind of a mess. i rewrote most of it over the weekend and it's much cleaner now, though there are still a few rough edges i want to smooth out. anyway if anyone has feedback i'm all ears, always happy to learn from people who know more than me",
    tell: 'It performs the casual register — lowercase, a shrug, a humble close — but never names one thing. No file, no person, no number, no weekend that actually happened.',
  },
  {
    id: 't-hu-7',
    kind: 'text',
    difficulty: 'hard',
    isAI: false,
    content:
      "The talk was three things at once — a demo, an apology, and a recruitment pitch — and it worked because Sara refused to hide the part where the model confidently mislabelled her own thesis abstract as machine-written. Nobody remembers the accuracy number. Everyone remembers the abstract.",
    tell: 'Reads like model prose on the surface — em dash, a three-part list — but it names a person, an incident, and an outcome that contradicts the pitch. Style is not provenance.',
  },

  /* ----------------------------- code · traps ------------------------------ */
  {
    id: 'c-ai-7',
    kind: 'code',
    lang: 'python',
    difficulty: 'hard',
    isAI: true,
    content:
      'def chunk(items, size):\n    # quick and dirty, works fine for our sizes\n    if size <= 0:\n        raise ValueError("size must be positive")\n    result = []\n    for i in range(0, len(items), size):\n        result.append(items[i:i + size])\n    return result',
    tell: 'The comment imitates a scrappy human aside, but the code under it is textbook: a defensive guard nobody asked for, an accumulator where a comprehension would do, and no actual dirt.',
  },
  {
    id: 'c-hu-7',
    kind: 'code',
    lang: 'typescript',
    difficulty: 'hard',
    isAI: false,
    content:
      '/**\n * Poll until the job leaves the queue.\n *\n * Do NOT lower the interval below 800ms — their gateway starts returning\n * cached 202s and you will poll a finished job forever. Found this out on\n * the 14th, see the incident doc.\n */\nexport async function waitForJob(id: string, intervalMs = 800) {\n  for (;;) {\n    const r = await getJob(id);\n    if (r.state !== "queued") return r;\n    await sleep(intervalMs);\n  }\n}',
    tell: 'A full docstring reads as generated — until you notice it documents a vendor bug, a date, and an incident doc. Models write what the code does; people write what already went wrong.',
  },

  /* ------------------------------ image · AI ------------------------------- */
  {
    id: 'i-ai-1',
    kind: 'image',
    difficulty: 'easy',
    isAI: true,
    content: '/game/images/ai-shrine.jpg',
    tell: 'Torii gates repeat at spacings that never resolve into a path you could walk, and every surface carries the same soft bloom. No lens lights a whole scene that evenly.',
    credit: { license: 'Public domain', author: 'Benlisquare', source: 'https://commons.wikimedia.org/wiki/File:Algorithmically-generated_landscape_artwork_of_forest_with_Shinto_shrine.png' },
  },
  {
    id: 'i-ai-2',
    kind: 'image',
    difficulty: 'easy',
    isAI: true,
    content: '/game/images/ai-shrine-b.jpg',
    tell: 'The mountain fuses into the treeline with no horizon anywhere, and the shrine roofs stack in a way no structure could hold up.',
    credit: { license: 'Public domain', author: 'Benlisquare', source: 'https://commons.wikimedia.org/wiki/File:Algorithmically-generated_landscape_artwork_of_forest_with_Shinto_shrine_using_negative_prompt_for_round_stones.png' },
  },
  {
    id: 'i-ai-3',
    kind: 'image',
    difficulty: 'easy',
    isAI: true,
    content: '/game/images/ai-nightcity.jpg',
    tell: 'Neon reflections that match no visible source, windows lit in patterns with no floor logic behind them, and a skyline that dissolves into texture at the edges.',
    credit: { license: 'CC BY 4.0', author: 'VulcanSphere', source: 'https://commons.wikimedia.org/wiki/File:NightCitySphere_(SDXL).jpg' },
  },
  {
    id: 'i-ai-4',
    kind: 'image',
    difficulty: 'medium',
    isAI: true,
    content: '/game/images/ai-tanuki.jpg',
    tell: 'The speech bubble is filled with strokes that imitate Japanese without spelling anything. Garbled text is still the most reliable generator tell there is.',
    credit: { license: 'Public domain', author: 'Microsoft Designer / DALL-E 3', source: 'https://commons.wikimedia.org/wiki/File:AI_tanuki_Japanese_text.jpg' },
  },
  {
    id: 'i-ai-5',
    kind: 'image',
    difficulty: 'medium',
    isAI: true,
    content: '/game/images/ai-dalle-photo.jpg',
    tell: 'Photoreal texture on an impossible scene, and the keyboard melts into the paws exactly where the model had to decide on an edge and could not.',
    credit: { license: 'Public domain', author: 'DALL-E 2', source: 'https://commons.wikimedia.org/wiki/File:DALL-E_2_artificial_intelligence_digital_image_generated_photo.jpg' },
  },

  /* ----------------------------- image · human ----------------------------- */
  {
    id: 'i-hu-1',
    kind: 'image',
    difficulty: 'easy',
    isAI: false,
    content: '/game/images/hu-faisal.jpg',
    tell: 'Legible road signage, real haze on the Margallas, and traffic at inconsistent distances. Nothing is composed and nothing is symmetrical.',
    credit: { license: 'CC BY-SA 4.0', author: 'Fassifarooq', source: 'https://commons.wikimedia.org/wiki/File:Faisal_Mosque,_Islamabad_III.jpg' },
  },
  {
    id: 'i-hu-2',
    kind: 'image',
    difficulty: 'medium',
    isAI: false,
    content: '/game/images/hu-damankoh.jpg',
    tell: 'A blown-out sky the photographer could not save, a crowd caught mid-stride in unremarkable postures, and railings that are simply in the way.',
    credit: { license: 'CC BY-SA 3.0', author: 'Xubayr Mayo', source: 'https://commons.wikimedia.org/wiki/File:Daman-E-Koh.jpg' },
  },
  {
    id: 'i-hu-3',
    kind: 'image',
    difficulty: 'medium',
    isAI: false,
    content: '/game/images/hu-constitution.jpg',
    tell: 'Perspective stays honest from the foreground leaves all the way to the hills, and every building keeps its geometry at distance. Generators lose that at the third plane.',
    credit: { license: 'CC BY-SA 4.0', author: 'Zacharie Grossen', source: 'https://commons.wikimedia.org/wiki/File:Constitution_Avenue.jpg' },
  },
  {
    id: 'i-hu-4',
    kind: 'image',
    difficulty: 'easy',
    isAI: false,
    content: '/game/images/hu-ataturk.jpg',
    tell: 'Lane markings, kerb wear, and trees that are individually irregular, with focus falling off the way a real lens rolls off.',
    credit: { license: 'CC BY-SA 3.0', author: 'Obaid747', source: 'https://commons.wikimedia.org/wiki/File:Ataturk_Avenue_-_Islamabad.JPG' },
  },
  /* -------------------- image · AI (photorealistic tier) ------------------- */
  {
    id: 'i-ai-6',
    kind: 'image',
    difficulty: 'hard',
    isAI: true,
    content: '/game/images/ai-gan-face.jpg',
    tell: 'A GAN portrait. The face itself is flawless — that is the trap. Look past it: the background dissolves into smeared paint and the hair fuses into the shoulder, because the network never learned what is behind a person.',
    credit: { license: 'Public domain', author: 'StyleGAN', source: 'https://commons.wikimedia.org/wiki/File:GAN_deepfake_white_girl.jpg' },
  },
  {
    id: 'i-ai-7',
    kind: 'image',
    difficulty: 'hard',
    isAI: true,
    content: '/game/images/ai-gan-woman.jpg',
    tell: 'Another synthetic portrait. Faces are the one thing generators nail, so check the edges instead: the lighting on the eyes disagrees, and the ear and hairline blur into each other.',
    credit: { license: 'Public domain', author: 'StyleGAN', source: 'https://commons.wikimedia.org/wiki/File:Woman_1.jpg' },
  },
  {
    id: 'i-ai-8',
    kind: 'image',
    difficulty: 'medium',
    isAI: true,
    content: '/game/images/ai-pope.jpg',
    tell: 'The Midjourney image that fooled most of the internet in 2023. Follow the crucifix chain — it lies over the coat, then under it, then stops existing — and the hand below it grips nothing.',
    credit: { license: 'Public domain', author: 'Midjourney (widely published example)', source: 'https://commons.wikimedia.org/wiki/File:Pope_Francis_in_puffy_winter_jacket.jpg' },
  },
  {
    id: 'i-ai-9',
    kind: 'image',
    difficulty: 'hard',
    isAI: true,
    content: '/game/images/ai-faceswap.jpg',
    tell: 'A face swap, not a whole generated frame. The pasted face carries different grain and a different light direction from the neck and ears it sits on, and the jaw smears where the blend gave up.',
    credit: { license: 'CC BY 2.0', author: 'Face swap demonstration', source: 'https://commons.wikimedia.org/wiki/File:Face_swap_with_Xavier.jpg' },
  },
  {
    id: 'i-ai-10',
    kind: 'image',
    difficulty: 'medium',
    isAI: true,
    content: '/game/images/ai-opera.jpg',
    tell: 'The Midjourney piece that won a state fair art prize in 2022. Painterly and genuinely beautiful, but not one figure has a resolvable face and the architecture repeats without ever becoming a building.',
    credit: { license: 'Public domain', author: 'Midjourney / Jason Allen (widely published)', source: 'https://commons.wikimedia.org/wiki/File:Théâtre_D’opéra_Spatial.png' },
  },

  /* ---------------------- image · human (photographs) ---------------------- */
  {
    id: 'i-hu-5',
    kind: 'image',
    difficulty: 'medium',
    isAI: false,
    content: '/game/images/hu-6throad.jpg',
    tell: 'Overhead wires, a metro bus lane, and a clock tower with real weathering on it. The composition is accidental — a pole cuts straight through the frame and nobody moved.',
    credit: { license: 'CC BY-SA 4.0', author: 'Wikimedia contributor', source: 'https://commons.wikimedia.org/wiki/File:6th_road_Rawalpindi.jpg' },
  },
  {
    id: 'i-hu-6',
    kind: 'image',
    difficulty: 'medium',
    isAI: false,
    content: '/game/images/hu-fawara.jpg',
    tell: 'Top-down on a working intersection: every vehicle sits at its own angle, none of them repeat, and there is a pink marquee in the middle that no one would have composed.',
    credit: { license: 'CC BY-SA 4.0', author: 'Wikimedia contributor', source: 'https://commons.wikimedia.org/wiki/File:Fawara_Chowk_Rawalpindi.jpg' },
  },
  {
    id: 'i-hu-7',
    kind: 'image',
    difficulty: 'hard',
    isAI: false,
    content: '/game/images/hu-faizabad.jpg',
    tell: 'Real haze thins the far city to flat grey — a depth cue generators fake badly — and the interchange keeps consistent geometry the whole way to the horizon.',
    credit: { license: 'CC BY-SA 4.0', author: 'Wikimedia contributor', source: 'https://commons.wikimedia.org/wiki/File:Faizabad_Interchange,_Rawalpindi.jpg' },
  },
  {
    id: 'i-hu-8',
    kind: 'image',
    difficulty: 'medium',
    isAI: false,
    content: '/game/images/hu-college.jpg',
    tell: 'Urdu shop signage that actually reads as words, tangled power lines, parked cars and a bit of litter. Generators tidy that clutter away; a street does not.',
    credit: { license: 'CC BY-SA 4.0', author: 'Wikimedia contributor', source: 'https://commons.wikimedia.org/wiki/File:College_Road_Rawalpindi.jpg' },
  },
  {
    id: 'i-hu-9',
    kind: 'image',
    difficulty: 'hard',
    isAI: false,
    content: '/game/images/hu-bagh.jpg',
    tell: 'Legible Urdu graffiti along the wall and a bare tree whose branching never repeats. Text is exactly where generators fall apart — here every character is spelled correctly.',
    credit: { license: 'CC BY-SA 3.0', author: 'Wikimedia contributor', source: 'https://commons.wikimedia.org/wiki/File:Bagh_Sardaran.JPG' },
  },
  {
    id: 'i-hu-10',
    kind: 'image',
    difficulty: 'medium',
    isAI: false,
    content: '/game/images/hu-fjwu.jpg',
    tell: 'A symmetrical white building, which reads as generated — until you notice every shadow agrees on one real sun and a palm grows through the frame at an angle nobody would choose.',
    credit: { license: 'CC BY-SA 3.0', author: 'Wikimedia contributor', source: 'https://commons.wikimedia.org/wiki/File:FJWU_main_building.JPG' },
  },
];
