import { Lesson, Phrase } from './types';

export const LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Small Talk',
    category: 'Casual Conversation',
    youtubeVideoId: 'k7PNo_bC1gQ', // Suggested English Speaking Practice
    youtubeTimestamp: 10,
    sentences: [
      {
        id: 101,
        lessonId: 1,
        text: "Hi, how's everything going?",
        ipa: "/haɪ, haʊz ˈɛvriˌθɪŋ ˈɡoʊɪŋ/"
      },
      {
        id: 102,
        lessonId: 1,
        text: "Not bad at all, keeping busy as usual.",
        ipa: "/nɑt bæd æt ɔl, ˈkiːpɪŋ ˈbɪzi æz ˈjuːʒuəl/"
      },
      {
        id: 103,
        lessonId: 1,
        text: "Same here. Hey, did you catch the game last night?",
        ipa: "/seɪm hɪr. heɪ, dɪd ju kæʧ ðə ɡeɪm læst naɪt/"
      },
      {
        id: 104,
        lessonId: 1,
        text: "I missed it. Was it any good?",
        ipa: "/aɪ mɪst ɪt. wʌz ɪt ˈɛni ɡʊd/"
      },
      {
        id: 105,
        lessonId: 1,
        text: "It was incredible, went into overtime.",
        ipa: "/ɪt wʌz ɪnˈkrɛdəbəl, wɛnt ˈɪntu ˈoʊvərˌtaɪm/"
      }
    ]
  },
  {
    id: 2,
    title: 'Job Interview',
    category: 'Professional / Career',
    youtubeVideoId: '1mHjMNZZvFo', // Job Interview Practice
    youtubeTimestamp: 20,
    sentences: [
      {
        id: 201,
        lessonId: 2,
        text: "Tell me a little about yourself.",
        ipa: "/tɛl mi ə ˈlɪtəl əˈbaʊt jʊərˈsɛlf/"
      },
      {
        id: 202,
        lessonId: 2,
        text: "Sure. I have about three years of experience in B2B sales.",
        ipa: "/ʃʊr. aɪ hæv əˈbaʊt θri jɪrz ʌv ɪkˈspɪriəns ɪn B2B seɪlz/"
      },
      {
        id: 203,
        lessonId: 2,
        text: "What would you say is your biggest strength?",
        ipa: "/wʌt wʊd ju seɪ ɪz jʊər ˈbɪɡəst strɛŋθ/"
      },
      {
        id: 204,
        lessonId: 2,
        text: "I'd say it's my ability to stay calm under pressure.",
        ipa: "/aɪd seɪ ɪts maɪ əˈbɪlɪti tu steɪ kɑm ˈʌndər ˈprɛʃər/"
      },
      {
        id: 205,
        lessonId: 2,
        text: "Can you give me an example of that?",
        ipa: "/kæn ju ɡɪv mi ən ɪɡˈzæmpəl ʌv ðæt/"
      }
    ]
  },
  {
    id: 3,
    title: 'Client Call',
    category: 'Work / Collaboration',
    youtubeVideoId: 'HAnw168huqA', // Client meeting skills
    youtubeTimestamp: 15,
    sentences: [
      {
        id: 301,
        lessonId: 3,
        text: "Thanks for jumping on this call.",
        ipa: "/θæŋks fɔr ˈʤʌmpɪŋ ɑn ðɪs kɔl/"
      },
      {
        id: 302,
        lessonId: 3,
        text: "Of course, happy to connect.",
        ipa: "/ʌv kɔrs, ˈhæpi tu kəˈnɛkt/"
      },
      {
        id: 303,
        lessonId: 3,
        text: "So I wanted to follow up on the proposal we sent last week.",
        ipa: "/soʊ aɪ ˈwɑntəd tu ˈfɑloʊ ʌp ɑn ðə prəˈpoʊzəl wi sɛnt læst wik/"
      },
      {
        id: 304,
        lessonId: 3,
        text: "Yes, we've had a chance to review it.",
        ipa: "/jɛs, wiv hæd ə ʧæns tu rɪˈvju ɪt/"
      },
      {
        id: 305,
        lessonId: 3,
        text: "Great. Do you have any questions or concerns?",
        ipa: "/ɡreɪt. du ju hæv ˈɛni ˈkwɛsʧənz ɔr kənˈsɜrnz/"
      }
    ]
  },
  {
    id: 4,
    title: 'Disagreeing Politely',
    category: 'Communication Skills',
    youtubeVideoId: 'ezS7S_Z02fE', // Polite disagreement
    youtubeTimestamp: 30,
    sentences: [
      {
        id: 401,
        lessonId: 4,
        text: "I see your point, but I have a slightly different take.",
        ipa: "/aɪ si jʊər pɔɪnt, bʌt aɪ hæv ə ˈslaɪtli ˈdɪfərənt teɪk/"
      },
      {
        id: 402,
        lessonId: 4,
        text: "I'd push back a little on that.",
        ipa: "/aɪd pʊʃ bæk ə ˈlɪtəl ɑn ðæt/"
      },
      {
        id: 403,
        lessonId: 4,
        text: "That's fair, though I think we should also consider...",
        ipa: "/ðæts fɛr, ðoʊ aɪ θɪŋk wi ʃʊd ˈɔlsoʊ kənˈsɪdər/"
      },
      {
        id: 404,
        lessonId: 4,
        text: "I understand where you're coming from.",
        ipa: "/aɪ ˈʌndərˌstænd wɛr jʊr ˈkʌmɪŋ frʌm/"
      },
      {
        id: 405,
        lessonId: 4,
        text: "Can we find a middle ground here?",
        ipa: "/kæn wi faɪnd ə ˈmɪdəl ɡraʊnd hɪr/"
      }
    ]
  },
  {
    id: 5,
    title: 'Travel / Daily',
    category: 'Survival English',
    youtubeVideoId: 'UvCIsV-eYco', // Travel phrases
    youtubeTimestamp: 5,
    sentences: [
      {
        id: 501,
        lessonId: 5,
        text: "Excuse me, could you tell me how to get to the city center?",
        ipa: "/ɪkˈskjus mi, kʊd ju tɛl mi haʊ tu ɡɛt tu ðə ˈsɪti ˈsɛntər/"
      },
      {
        id: 502,
        lessonId: 5,
        text: "Sure, just take the subway, line 2, about four stops.",
        ipa: "/ʃʊr, ʤʌst teɪk ðə ˈsʌbˌweɪ, laɪn tu, əˈbaʊt fɔr stɑps/"
      },
      {
        id: 503,
        lessonId: 5,
        text: "Is it within walking distance from here?",
        ipa: "/ɪz ɪt wɪˈðɪn ˈwɔkɪŋ ˈdɪstəns frʌm hɪr/"
      },
      {
        id: 504,
        lessonId: 5,
        text: "It's about 20 minutes on foot.",
        ipa: "/ɪts əˈbaʊt ˈtwɛnti ˈmɪnəts ɑn fʊt/"
      },
      {
        id: 505,
        lessonId: 5,
        text: "Perfect, thank you so much.",
        ipa: "/ˈpɜrfɪkt, θæŋk ju soʊ mʌʧ/"
      }
    ]
  }
];

export const PHRASE_BANK_RAW: { id: number; group: 'small-talk' | 'business' | 'travel'; text: string }[] = [
  // Group 1: Small talk
  { id: 1, group: 'small-talk', text: "How's everything going?" },
  { id: 2, group: 'small-talk', text: "Not bad, keeping busy." },
  { id: 3, group: 'small-talk', text: "What have you been up to lately?" },
  { id: 4, group: 'small-talk', text: "Long time no see!" },
  { id: 5, group: 'small-talk', text: "How's the family?" },
  { id: 6, group: 'small-talk', text: "Any exciting plans for the weekend?" },
  { id: 7, group: 'small-talk', text: "I've been meaning to catch up with you." },
  { id: 8, group: 'small-talk', text: "It's been a while, hasn't it?" },
  { id: 9, group: 'small-talk', text: "How did that project turn out?" },
  { id: 10, group: 'small-talk', text: "We should grab coffee sometime." },

  // Group 2: Business
  { id: 11, group: 'business', text: "I wanted to follow up on my previous email." },
  { id: 12, group: 'business', text: "Could we schedule a quick call?" },
  { id: 13, group: 'business', text: "I'll loop you in on the thread." },
  { id: 14, group: 'business', text: "Let me circle back to you on that." },
  { id: 15, group: 'business', text: "Can we align on the timeline?" },
  { id: 16, group: 'business', text: "I'd like to get your thoughts on this." },
  { id: 17, group: 'business', text: "Let's take this offline." },
  { id: 18, group: 'business', text: "I'll send over the details by EOD." },
  { id: 19, group: 'business', text: "Does that work on your end?" },
  { id: 20, group: 'business', text: "Happy to jump on a call if that's easier." },

  // Group 3: Travel / Daily
  { id: 21, group: 'travel', text: "Could I get the check, please?" },
  { id: 22, group: 'travel', text: "Do you have this in a different size?" },
  { id: 23, group: 'travel', text: "Is the tip included?" },
  { id: 24, group: 'travel', text: "I'd like to make a reservation for two." },
  { id: 25, group: 'travel', text: "Could you speak a little slower, please?" },
  { id: 26, group: 'travel', text: "Sorry, could you repeat that?" },
  { id: 27, group: 'travel', text: "Where's the nearest pharmacy?" },
  { id: 28, group: 'travel', text: "I think there's a mistake on my bill." },
  { id: 29, group: 'travel', text: "Can I pay by card?" },
  { id: 30, group: 'travel', text: "How long is the wait?" }
];
