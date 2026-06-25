  // nav scroll state
  const nav=document.getElementById('nav');
  addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>20));

  // mobile menu
  const btn=document.getElementById('menuBtn'),links=document.getElementById('navLinks');
  btn.addEventListener('click',()=>links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));

  // reveal on scroll
  const io=new IntersectionObserver((es)=>{
    es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach((el,i)=>{
    el.style.transitionDelay=(Math.min(i,6)*0.05)+'s';
    io.observe(el);
  });

  // contact form -> mailto
  document.getElementById('sendBtn').addEventListener('click',()=>{
    const name=document.getElementById('name').value.trim();
    const subj=document.getElementById('subj').value.trim()||'Anfrage über Ihr Portfolio';
    const msg=document.getElementById('msg').value.trim();
    const body=(name?('Von: '+name+'\n\n'):'')+msg;
    location.href='mailto:f.kierski@floriankierski.de?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);
  });

  // E-Mail kopieren
  const copyBtn=document.getElementById('copyEmail');
  if(copyBtn){
    const copyIcon=copyBtn.innerHTML;
    const checkIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    copyBtn.addEventListener('click',async(e)=>{
      e.preventDefault();e.stopPropagation();
      const txt=copyBtn.dataset.copy;
      try{
        if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(txt);}
        else{const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');ta.remove();}
        copyBtn.classList.add('copied');copyBtn.innerHTML=checkIcon;copyBtn.setAttribute('aria-label','E-Mail-Adresse kopiert');
        setTimeout(()=>{copyBtn.classList.remove('copied');copyBtn.innerHTML=copyIcon;copyBtn.setAttribute('aria-label','E-Mail-Adresse kopieren');},1600);
      }catch(err){}
    });
  }

  // ====== PROJEKT-GALERIE — hier Projekte & Bilder pflegen ==============
  // Neues Bild zu einem Projekt: Datei in den Ordner "images/" legen und unten
  // beim passenden Projekt eine Zeile in "images" ergaenzen.
  // Neues Projekt: einen Block { id, title, sub, images:[...] } hinzufuegen.
  // Die ersten 3 Projekte erscheinen als Kacheln in der Karte, der Rest unter "mehr".
  const PROJECTS = [
    { id:'racingleague', title:'RacingLeague', sub:'Logo, Social-Media- & Event-Design', images:[
      { src:'images/racingleague-logo.png',          cap:'Logo & Branding' },
      { src:'images/racingleague-gesamtwertung.gif', cap:'Gesamtwertung (animiert)' },
      { src:'images/racingleague-teamranking.jpg',   cap:'Team-Ranking' },
      { src:'images/racingleague-event.jpg',         cap:'Event-Flyer' },
    ]},
    { id:'getraenke', title:'Getränkekarte', sub:'Menü-Design „Die Sorten“', images:[
      { src:'images/getraenkekarte.jpg', cap:'Die Sorten' },
    ]},
    { id:'cure', title:'Cure', sub:'Logo & Stream-Branding (Twitch)', images:[
      { src:'images/cure-logo.png',   cap:'Logo & Branding' },
      { src:'images/cure-banner.jpg', cap:'Stream-Banner' },
    ]},
    { id:'lindenplatz', title:'Lindenplatz', sub:'App-Konzept (UX/UI)', images:[
      { src:'images/lindenplatz-app.jpg', cap:'App-Konzept (UX/UI)' },
    ]},
    { id:'helpinghands', title:'Helping Hands', sub:'Spenden-Kampagne (Banner)', images:[
      { src:'images/helping-hands-banner.jpg', cap:'Spenden-Banner' },
    ]},
  ];
  // ======================================================================

  const lb=document.getElementById('lightbox');
  const lbOverview=document.getElementById('lbOverview'), lbViewer=document.getElementById('lbViewer');
  const lbOvGrid=document.getElementById('lbOvGrid');
  const lbImg=document.getElementById('lbImg'), lbCap=document.getElementById('lbCap'), lbCounter=document.getElementById('lbCounter');
  const lbPrev=document.getElementById('lbPrev'), lbNext=document.getElementById('lbNext');
  const gthumbs=document.getElementById('gthumbs');
  const LEAD=3;
  let curP=0, curI=0;

  // Karten-Kacheln: erste LEAD Projekte + "mehr"
  PROJECTS.slice(0,LEAD).forEach((proj,pi)=>{
    const im=document.createElement('img');
    im.className='gthumb'; im.src=proj.images[0].src; im.alt=proj.title; im.title=proj.title; im.loading='lazy';
    im.addEventListener('click',()=>openProject(pi));
    im.addEventListener('error',()=>{im.classList.add('missing');im.alt=proj.title+' (Bild fehlt)';});
    gthumbs.appendChild(im);
  });
  if(PROJECTS.length>LEAD){
    const btn=document.createElement('button');
    btn.type='button'; btn.className='gthumb gthumb-more';
    btn.style.backgroundImage='url("'+PROJECTS[LEAD].images[0].src+'")';
    btn.setAttribute('aria-label','Alle Projekte ansehen');
    const sp=document.createElement('span'); sp.textContent='+'+(PROJECTS.length-LEAD)+' mehr';
    btn.appendChild(sp);
    btn.addEventListener('click',openOverview);
    gthumbs.appendChild(btn);
  }

  // Ebene 1: Projektübersicht
  function buildOverview(){
    lbOvGrid.innerHTML='';
    PROJECTS.forEach((proj,pi)=>{
      const n=proj.images.length;
      const card=document.createElement('button');
      card.type='button'; card.className='ov-card';
      card.innerHTML='<img class="ov-img" src="'+proj.images[0].src+'" alt="'+proj.title+'" loading="lazy">'
        +'<div class="ov-meta"><div class="ov-name">'+proj.title+'</div>'
        +'<div class="ov-info">'+proj.sub+' · '+n+(n===1?' Bild':' Bilder')+'</div></div>';
      card.addEventListener('click',()=>openProject(pi));
      lbOvGrid.appendChild(card);
    });
  }
  function openOverview(){
    buildOverview();
    lbViewer.hidden=true; lbOverview.hidden=false;
    lb.classList.add('open'); document.body.style.overflow='hidden';
  }

  // Ebene 2: Projekt-Viewer
  function openProject(pi){
    curP=pi; curI=0;
    lbOverview.hidden=true; lbViewer.hidden=false;
    lb.classList.add('open'); document.body.style.overflow='hidden';
    renderImage();
  }
  function renderImage(){
    const proj=PROJECTS[curP], n=proj.images.length;
    curI=(curI+n)%n;
    const img=proj.images[curI];
    lbImg.src=img.src; lbImg.alt=proj.title+' — '+img.cap;
    lbCap.textContent=proj.title+' — '+img.cap;
    const multi=n>1;
    lbPrev.hidden=!multi; lbNext.hidden=!multi;
    lbCounter.textContent=multi?(curI+1)+' / '+n:'';
  }
  function closeLb(){ lb.classList.remove('open'); document.body.style.overflow=''; }

  document.getElementById('lbClose').addEventListener('click',closeLb);
  document.getElementById('lbBack').addEventListener('click',openOverview);
  lbPrev.addEventListener('click',()=>{curI--;renderImage();});
  lbNext.addEventListener('click',()=>{curI++;renderImage();});
  const og=document.getElementById('openGallery'); if(og) og.addEventListener('click',openOverview);
  lb.addEventListener('click',e=>{if(e.target===lb)closeLb();});
  addEventListener('keydown',e=>{
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape'){ if(!lbViewer.hidden){openOverview();} else {closeLb();} return; }
    if(!lbViewer.hidden){
      if(e.key==='ArrowLeft'){curI--;renderImage();}
      if(e.key==='ArrowRight'){curI++;renderImage();}
    }
  });
  // Mausrad im Viewer: runter = vorwaerts, hoch = zurueck (mit Sperre gegen Mehrfach-Sprung)
  let lastWheel=0;
  lb.addEventListener('wheel',e=>{
    if(!lb.classList.contains('open')||lbViewer.hidden) return;   // nur im Projekt-Viewer
    const proj=PROJECTS[curP];
    if(!proj||proj.images.length<2) return;                       // nur bei mehreren Bildern
    if(Math.abs(e.deltaY)<8) return;
    e.preventDefault();
    const now=Date.now();
    if(now-lastWheel<350) return;                                 // eine Wischbewegung = ein Bild
    lastWheel=now;
    if(e.deltaY>0){curI++;}else{curI--;}
    renderImage();
  },{passive:false});

  // Hero-Glow: nah wegdruecken, sonst leicht folgen — auf ganzer Seite, sanft durch den Mittelpunkt
  (function(){
    const hero=document.querySelector('.hero'), glow=document.getElementById('heroGlow');
    if(!hero||!glow) return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const PX=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--parallax'))||0;
    if(!PX) return;
    const EASE=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--parallax-ease'))||0.06;
    const FOLLOW=PX*0.32, PUSH=PX*0.9, R=320, MAX=PX*1.25;   // R = Wirkradius des Wegdrueckens (px)
    const G=PUSH*4/R;                                        // Verstaerkung: Kraft ~ Abstand (durch Zentrum = 0 = kein Umspringen)
    let tx=0,ty=0,cx=0,cy=0,raf=null;
    const clamp=(v,m)=>Math.max(-m,Math.min(m,v));
    function loop(){
      cx+=(tx-cx)*EASE; cy+=(ty-cy)*EASE;
      glow.style.transform='translate('+cx.toFixed(2)+'px,'+cy.toFixed(2)+'px)';
      if(Math.abs(tx-cx)>0.12||Math.abs(ty-cy)>0.12){ raf=requestAnimationFrame(loop); }
      else { glow.style.transform='translate('+tx+'px,'+ty+'px)'; raf=null; }
    }
    function kick(){ if(!raf) raf=requestAnimationFrame(loop); }
    window.addEventListener('mousemove',e=>{
      const hr=hero.getBoundingClientRect();
      let nx=clamp((e.clientX-hr.left)/hr.width-0.5,0.5), ny=clamp((e.clientY-hr.top)/hr.height-0.5,0.5);
      let fx=nx*FOLLOW, fy=ny*FOLLOW;                        // leichtes Folgen
      const gr=glow.getBoundingClientRect();                 // sanftes Wegdruecken
      const rcx=gr.left+gr.width/2-cx, rcy=gr.top+gr.height/2-cy;
      const dx=e.clientX-rcx, dy=e.clientY-rcy, dist=Math.hypot(dx,dy);
      if(dist<R){ const f=1-dist/R; fx+=-dx*f*G; fy+=-dy*f*G; }  // ~Abstand -> im Zentrum 0, kein Snap
      tx=clamp(fx,MAX); ty=clamp(fy,MAX);
      kick();
    });
    document.addEventListener('mouseleave',()=>{ tx=0; ty=0; kick(); }); // nur wenn die Maus die Seite verlaesst
  })();
