import { PrismaClient, PostStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
const db = new PrismaClient();
async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@healthpress.local';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.upsert({
    where: { email },
    update: { name: 'Administrator', passwordHash, role: 'ADMIN', active: true },
    create: { name: 'Administrator', email, passwordHash, role: 'ADMIN', active: true },
  });
  const health = await db.category.upsert({ where: { slug: 'health' }, update: {}, create: { name: 'Health', slug: 'health', description: 'Community health, wellbeing and medical awareness.', order: 1 } });
  const menuCategories = [
    {name:'Events',nameTe:'ఈవెంట్స్',slug:'events',order:1},{name:'Politics',nameTe:'రాజకీయాలు',slug:'politics',order:2},{name:'Jokes',nameTe:'జోక్స్',slug:'jokes',order:3},{name:'Health',nameTe:'ఆరోగ్యం',slug:'health',order:4},{name:'Movies',nameTe:'సినిమాలు',slug:'movies',order:5},{name:'Comedy',nameTe:'కామెడీ',slug:'comedy',order:6},{name:'Photos',nameTe:'ఫోటోలు',slug:'photos',order:7},{name:'Videos',nameTe:'వీడియోలు',slug:'videos',order:8},{name:'Literary',nameTe:'సాహిత్యం',slug:'literary',order:9}
  ];
  for (const c of menuCategories) await db.category.upsert({where:{slug:c.slug},update:{name:c.name,nameTe:c.nameTe,order:c.order},create:c});
  await db.siteSetting.upsert({ where: { id: 1 }, update: {taglineTe:'సరిహద్దులు లేని శ్రేయస్సు',heroTitleTe:'మంచి కథతో ఆరోగ్యకరమైన సమాజం మొదలవుతుంది',heroDescriptionTe:'ప్రపంచవ్యాప్తంగా అనుసంధానమైన కుటుంబాల కోసం స్పష్టమైన ఆరోగ్య వార్తలు మరియు సమాజ కథనాలు.',footerTextTe:'స్వతంత్ర ఆరోగ్య మరియు సమాజ జర్నలిజం.'}, create: { id: 1, siteName: 'HealthPress', tagline: 'Wellbeing without borders',taglineTe:'సరిహద్దులు లేని శ్రేయస్సు', heroTitle: 'A healthier community starts with a good story',heroTitleTe:'మంచి కథతో ఆరోగ్యకరమైన సమాజం మొదలవుతుంది', heroDescription: 'Clear, useful health journalism and community updates created for globally connected families.',heroDescriptionTe:'ప్రపంచవ్యాప్తంగా అనుసంధానమైన కుటుంబాల కోసం స్పష్టమైన ఆరోగ్య వార్తలు మరియు సమాజ కథనాలు.', contactEmail: 'hello@healthpress.example', footerText: 'Independent health and community journalism.',footerTextTe:'స్వతంత్ర ఆరోగ్య మరియు సమాజ జర్నలిజం.' } });
  const samples = [
    {title:'Community health fair brings free screenings closer to families',slug:'community-health-fair-free-screenings',excerpt:'Doctors and volunteers joined hands to offer practical guidance, screenings and follow-up resources.',featured:true,imageUrl:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80'},
    {title:'Five small habits that make everyday wellbeing easier',slug:'five-small-wellbeing-habits',excerpt:'Sustainable routines often begin with simple, repeatable choices that fit real life.',featured:false,imageUrl:'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80'},
    {title:'How community walks create stronger support networks',slug:'community-walks-support-networks',excerpt:'Movement, conversation and shared purpose can turn a local event into lasting connection.',featured:false,imageUrl:'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=80'}
  ];
  for (const p of samples) await db.post.upsert({where:{slug:p.slug},update:{},create:{...p,imageAlt:p.title,content:`${p.excerpt}\n\nHealth is shaped by the information we can trust and the people around us. This sample article demonstrates the complete publishing flow. Sign in to the CMS to replace it with your own reporting, images and categories.\n\nAlways consult a qualified healthcare professional for personal medical advice.`,status:PostStatus.PUBLISHED,publishedAt:new Date(),categoryId:health.id}});

  const demoPosts = [
    {category:'events',title:'Community cultural festival brings generations together',excerpt:'Families gathered for an evening of music, food and traditions celebrating a shared heritage.',image:'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=80'},
    {category:'events',title:'Young professionals network launches annual leadership meet',excerpt:'Speakers and mentors shared practical ideas for building meaningful careers and community connections.',image:'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1400&q=80'},
    {category:'politics',title:'Community leaders discuss stronger civic participation',excerpt:'A public forum encouraged residents to learn about local issues and take part in democratic life.',image:'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=80'},
    {category:'politics',title:'New policy forum focuses on opportunities for global families',excerpt:'Experts examined education, small business and community services during a wide-ranging discussion.',image:'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1400&q=80'},
    {category:'jokes',title:'The video call that turned into a family comedy show',excerpt:'One muted microphone, three curious relatives and a very confused delivery driver made the meeting unforgettable.',image:'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1400&q=80'},
    {category:'jokes',title:'When dad discovered the family group chat stickers',excerpt:'A harmless good-morning message quickly became the most discussed post of the week.',image:'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=1400&q=80'},
    {category:'health',title:'Free wellness camp offers screenings and healthy-living advice',excerpt:'Volunteer clinicians helped community members understand preventive care and everyday wellbeing.',image:'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1400&q=80'},
    {category:'health',title:'Simple ways to protect your sleep during busy weeks',excerpt:'A consistent evening routine and a few small environmental changes can support better rest.',image:'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1400&q=80'},
    {category:'movies',title:'Independent filmmakers celebrate stories that cross borders',excerpt:'A new showcase highlighted fresh voices, intimate storytelling and international collaboration.',image:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80'},
    {category:'movies',title:'Weekend film festival announces audience-choice winners',excerpt:'Viewers selected their favourite drama, comedy and documentary from a diverse programme.',image:'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1400&q=80'},
    {category:'comedy',title:'Stand-up night delivers big laughs for a good cause',excerpt:'Local performers filled the room with warm observations about family, travel and everyday surprises.',image:'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1400&q=80'},
    {category:'comedy',title:'New comedy showcase gives emerging performers the spotlight',excerpt:'Fresh voices tested new material in a relaxed evening built around community and laughter.',image:'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1400&q=80'},
    {category:'photos',title:'In pictures: spring colours brighten the community garden',excerpt:'Volunteers transformed a shared outdoor space with flowers, herbs and welcoming places to meet.',image:'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1400&q=80'},
    {category:'photos',title:'Photo story: a joyful evening of music and dance',excerpt:'Our gallery captures the colour, movement and smiles from a memorable cultural celebration.',image:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80'},
    {category:'videos',title:'Watch: volunteers prepare hundreds of meals for neighbours',excerpt:'A behind-the-scenes video follows the teamwork that powered a weekend food-distribution drive.',image:'https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=1400&q=80'},
    {category:'videos',title:'Video guide: five stretches for a comfortable workday',excerpt:'A fitness coach demonstrates gentle movements suitable for short breaks between desk tasks.',image:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80'},
    {category:'literary',title:'Writers circle explores memory, migration and belonging',excerpt:'Poets and storytellers shared new work inspired by changing homes and lasting connections.',image:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80'},
    {category:'literary',title:'Book club selects a moving family story for this month',excerpt:'Readers will meet online and in person to discuss a novel about identity, courage and home.',image:'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=80'}
  ];
  const categoryRows = await db.category.findMany();
  const categoryBySlug = Object.fromEntries(categoryRows.map(c => [c.slug, c]));
  for (const [index, item] of demoPosts.entries()) {
    const category = categoryBySlug[item.category];
    if (!category) continue;
    const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await db.post.upsert({
      where:{slug},
      update:{categoryId:category.id,imageUrl:item.image,imageAlt:item.title},
      create:{title:item.title,slug,excerpt:item.excerpt,content:`${item.excerpt}\n\nThis demonstration story shows how articles appear throughout the publication. Editors can replace every part of it—including the headline, image, category, summary, body and publishing status—from the CMS.\n\nOur newsroom template is designed for community updates, useful explainers, event coverage, galleries and multimedia stories.`,imageUrl:item.image,imageAlt:item.title,status:PostStatus.PUBLISHED,featured:index===0,publishedAt:new Date(Date.now()-index*86400000),categoryId:category.id}
    });
  }
  const teluguStories = [
    {slug:'community-cultural-festival-brings-generations-together',titleTe:'తరాలను కలిపిన కమ్యూనిటీ సాంస్కృతిక ఉత్సవం',excerptTe:'సంగీతం, ఆహారం మరియు సంప్రదాయాలతో కుటుంబాలు కలిసి ఆనందంగా వేడుక జరుపుకున్నాయి.',contentTe:'సంగీతం, ఆహారం మరియు సంప్రదాయాలతో కుటుంబాలు కలిసి ఆనందంగా వేడుక జరుపుకున్నాయి.\n\nఈ నమూనా తెలుగు కథనం CMS నుండి శీర్షిక, చిత్రం, సారాంశం మరియు పూర్తి కంటెంట్‌ను ఎలా మార్చవచ్చో చూపిస్తుంది.'},
    {slug:'free-wellness-camp-offers-screenings-and-healthy-living-advice',titleTe:'ఉచిత ఆరోగ్య శిబిరంలో పరీక్షలు మరియు ఆరోగ్య సలహాలు',excerptTe:'నివారణ సంరక్షణ మరియు రోజువారీ శ్రేయస్సుపై వైద్యులు సమాజ సభ్యులకు మార్గదర్శనం చేశారు.',contentTe:'నివారణ సంరక్షణ మరియు రోజువారీ శ్రేయస్సుపై వైద్యులు సమాజ సభ్యులకు మార్గదర్శనం చేశారు.\n\nవ్యక్తిగత వైద్య సలహా కోసం ఎల్లప్పుడూ అర్హత కలిగిన ఆరోగ్య నిపుణులను సంప్రదించండి.'},
    {slug:'independent-filmmakers-celebrate-stories-that-cross-borders',titleTe:'సరిహద్దులు దాటిన కథలను జరుపుకున్న స్వతంత్ర చిత్రకారులు',excerptTe:'కొత్త స్వరాలు మరియు అంతర్జాతీయ సహకారాన్ని ప్రదర్శించిన ప్రత్యేక సినిమా కార్యక్రమం.',contentTe:'కొత్త స్వరాలు మరియు అంతర్జాతీయ సహకారాన్ని ప్రదర్శించిన ప్రత్యేక సినిమా కార్యక్రమం.\n\nప్రేక్షకులు విభిన్న సంస్కృతులు మరియు అనుభవాలను ప్రతిబింబించే చిత్రాలను ఆస్వాదించారు.'},
    {slug:'writers-circle-explores-memory-migration-and-belonging',titleTe:'జ్ఞాపకాలు, వలస మరియు అనుబంధంపై రచయితల చర్చ',excerptTe:'మారుతున్న ఇళ్లు మరియు నిలిచే అనుబంధాలపై కవులు, కథకులు తమ రచనలు పంచుకున్నారు.',contentTe:'మారుతున్న ఇళ్లు మరియు నిలిచే అనుబంధాలపై కవులు, కథకులు తమ రచనలు పంచుకున్నారు.\n\nఈ కార్యక్రమం కొత్త రచయితలకు తమ స్వరాన్ని పంచుకునే వేదికను అందించింది.'}
  ];
  for(const story of teluguStories) await db.post.updateMany({where:{slug:story.slug},data:story});
}
main().finally(() => db.$disconnect());
