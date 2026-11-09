/* P DAMIANI SPORTS — Catálogo e banners rotativos. */
(() => {
  'use strict';
  const cfg = typeof configuracao === 'object' ? configuracao : null;
  if (!cfg || !Array.isArray(cfg.ligas)) {
    document.getElementById('conteudo').textContent = 'Não foi possível carregar os dados do catálogo.';
    return;
  }
  const $ = (selector, base=document) => base.querySelector(selector);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const normalize = (v) => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
  const iconArrow = (dir) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('fill','none');
    svg.setAttribute('stroke','currentColor');
    svg.setAttribute('stroke-width','2.1');
    svg.setAttribute('stroke-linecap','round');
    svg.setAttribute('stroke-linejoin','round');
    svg.setAttribute('aria-hidden','true');
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',dir === 'left' ? 'M18 12H6m5.5 5.5L6 12l5.5-5.5' : 'M6 12h12m-5.5-5.5L18 12l-5.5 5.5');
    svg.append(path);
    return svg;
  };
  const allClubs = [];
  const carouselStates = [];
  const reducesMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanWhatsapp = (value) => String(value || '').replace(/\D/g,'');
  const asUrl = (u) => /^https:\/\//i.test(u || '') ? u : '';
  const instagramHref = asUrl(cfg.loja?.instagram);

  function makeWhatsappIcon(){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','currentColor');
    svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d','M12.04 2A9.94 9.94 0 0 0 2.1 11.92a9.8 9.8 0 0 0 1.34 4.96L2 22l5.29-1.38A9.96 9.96 0 1 0 12.04 2Zm0 18.12a8.15 8.15 0 0 1-4.16-1.14l-.3-.18-3.14.82.84-3.05-.2-.31A8.2 8.2 0 1 1 12.04 20.12Zm4.51-6.13c-.25-.12-1.47-.72-1.7-.8-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.24-.12-1.03-.38-1.96-1.22-.72-.65-1.21-1.44-1.35-1.69-.14-.24-.01-.38.11-.5.11-.11.24-.29.37-.43.12-.14.16-.24.24-.4.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.24-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.51.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.59.21-1.09.15-1.19-.06-.1-.22-.16-.46-.29Z');
    svg.append(path);return svg;
  }
  const whatsappNumber = cleanWhatsapp(cfg.loja?.whatsapp);
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '';
  function renderFloatingWhatsapp(){
    if(!whatsappHref) return;
    const link=el('a','whatsapp-floating');
    link.href=whatsappHref;
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.title='Abrir conversa no WhatsApp';
    link.setAttribute('aria-label','Conversar conosco pelo WhatsApp (abre em nova aba)');
    link.append(makeWhatsappIcon());
    $('#floating-contact').append(link);
  }
  function makeClub(club,isClone=false){
    const href=asUrl(club.link);
    const card=el(href?'a':'div','club-card'+(club.tipo === 'colecao' ? ' collection-card' : '')+(href?'':' is-unavailable'));
    if(href){card.href=href;card.target='_blank';card.rel='noopener noreferrer';card.setAttribute('aria-label',`Abrir catálogo de ${club.nome}`)}
    else{card.setAttribute('title',`Catálogo de ${club.nome} ainda não disponível`)}
    if(isClone){card.setAttribute('aria-hidden','true');if(href) card.tabIndex=-1}
    const circle=el('span','club-circle'+(club.tipo === 'colecao' ? ' collection-circle' : ''));
    const image=el('img');image.src=club.imagem;image.alt='';image.width=100;image.height=100;
    image.loading='lazy';image.decoding='async';image.draggable=false;
    const fallback=el('span','club-fallback',club.nome.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toLocaleUpperCase('pt-BR'));
    fallback.setAttribute('aria-hidden','true');
    image.addEventListener('load',()=>circle.classList.add('has-image'),{once:true});
    image.addEventListener('error',()=>circle.classList.add('has-fallback'),{once:true});
    circle.append(image,fallback);
    card.append(circle,el('span','club-name',club.nome.toLocaleUpperCase('pt-BR')));
    return card;
  }
  function makeSet(clubs,isClone){
    const set=el('div','carousel-set');
    if(isClone)set.setAttribute('aria-hidden','true');
    clubs.forEach(club=>set.append(makeClub(club,isClone)));
    return set;
  }
  function makeCarousel(liga){
    const shell=el('div','carousel');
    const viewport=el('div','carousel-viewport');viewport.setAttribute('aria-label',`Clubes de ${liga.nome}`);
    viewport.setAttribute('role','region');viewport.setAttribute('aria-roledescription','carrossel');
    viewport.tabIndex=0;
    const track=el('div','carousel-track');
    const first=makeSet(liga.clubes,true),middle=makeSet(liga.clubes,false),last=makeSet(liga.clubes,true);
    track.append(first,middle,last);viewport.append(track);shell.append(viewport);
    const controls=el('div','carousel-controls');
    for (const dir of ['left','right']) {
      const arrow=el('button','carousel-arrow');arrow.type='button';
      arrow.setAttribute('aria-label',dir==='left'?`Voltar clubes de ${liga.nome}`:`Avançar clubes de ${liga.nome}`);
      arrow.append(iconArrow(dir));
      arrow.addEventListener('click',()=>{
        state.pauseUntil=performance.now()+4000;
        const distance=viewport.querySelector('.club-card').getBoundingClientRect().width+
          parseFloat(getComputedStyle(first).gap || 0);
        viewport.scrollBy({left:(dir==='left'?-1:1)*distance*2,behavior:reducesMotion.matches?'instant':'smooth'});
      });
      controls.append(arrow);
    }
    shell.append(controls);
    const state={viewport,first,segment:0,visible:true,hovered:false,focused:false,dragging:false,pauseUntil:0};
    carouselStates.push(state);
    const resetScroll=()=>{
      const newWidth=first.getBoundingClientRect().width;
      if(newWidth<1) return;
      if(state.segment){
        const fraction=(viewport.scrollLeft-state.segment)/state.segment;
        viewport.scrollLeft=newWidth+fraction*newWidth;
      }else viewport.scrollLeft=newWidth;
      state.segment=newWidth;
    };
    requestAnimationFrame(resetScroll);
    if('ResizeObserver' in window){
      const observer=new ResizeObserver(resetScroll);observer.observe(first);
    }else window.addEventListener('resize',resetScroll,{passive:true});
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting},{threshold:.04});
      observer.observe(shell);
    }
    viewport.addEventListener('mouseenter',()=>state.hovered=true);
    viewport.addEventListener('mouseleave',()=>state.hovered=false);
    viewport.addEventListener('focusin',()=>state.focused=true);
    viewport.addEventListener('focusout',()=>state.focused=viewport.contains(document.activeElement));
    viewport.addEventListener('touchstart',()=>{state.pauseUntil=performance.now()+4500},{passive:true});
    viewport.addEventListener('touchmove',()=>{state.pauseUntil=performance.now()+4500},{passive:true});
    let dragStartX=0,dragStartScroll=0,suppressClickUntil=0,dragMoved=false;
    viewport.addEventListener('pointerdown',e=>{
      if(e.pointerType==='touch'||e.button!==0) return;
      state.dragging=true;dragMoved=false;dragStartX=e.clientX;dragStartScroll=viewport.scrollLeft;
      state.pauseUntil=performance.now()+5000;
    });
    viewport.addEventListener('pointermove',e=>{
      if(!state.dragging) return;
      const delta=e.clientX-dragStartX;
      if(Math.abs(delta)>5){
        if(!dragMoved){dragMoved=true;viewport.classList.add('is-dragging')}
        viewport.scrollLeft=dragStartScroll-delta;
        e.preventDefault();
      }
    });
    const dragEnd=()=>{
      if(!state.dragging) return;
      state.dragging=false;viewport.classList.remove('is-dragging');
      if(dragMoved){suppressClickUntil=Date.now()+350;dragMoved=false}
    };
    viewport.addEventListener('pointerup',dragEnd);
    viewport.addEventListener('pointercancel',dragEnd);
    viewport.addEventListener('pointerleave',dragEnd);
    viewport.addEventListener('click',e=>{
      if(Date.now()<suppressClickUntil){e.preventDefault();e.stopPropagation()}
    },true);
    // Pausar apenas nas entradas do usuário: scroll gerado pelo próprio autoplay não deve interromper o loop.
    viewport.addEventListener('wheel',()=>{state.pauseUntil=performance.now()+4000},{passive:true});
    viewport.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key))state.pauseUntil=performance.now()+4000;});
    return shell;
  }
  const colecoesIniciais=cfg.colecoesDestaque;
  const ligasExtras=Array.isArray(cfg.ligasExtras) ? cfg.ligasExtras : [];
  const secoesAdicionais=Array.isArray(cfg.secoesAdicionais) ? cfg.secoesAdicionais.filter(secao=>secao.ativo!==false) : [];
  const colecoesFinais=Array.isArray(cfg.colecoesFinais) ? cfg.colecoesFinais : [];
  const todasAsSecoes=[...(colecoesIniciais?[colecoesIniciais]:[]), ...cfg.ligas, ...ligasExtras, ...secoesAdicionais, ...colecoesFinais];
  const asCollection=(group)=>({...group, clubes:group.clubes.map(item=>({...item,tipo:'colecao'}))});

  function renderGroup(liga,order,hasHeading=false){
    const collection=liga.tipo==='colecoes';
    const data=collection?asCollection(liga):liga;
    const section=el('section','liga-section'+(collection?' collection-section':'')+(hasHeading?' section-with-heading':''));
    section.id=liga.id;
    section.setAttribute('aria-label',liga.nome);
    if(hasHeading){
      const heading=el('h2','collection-heading',liga.nome);
      section.append(heading);
    }
    if(liga.bannerDesktop){
      const banner=el('div','banner-container');
      const image=el('img');
      image.src=liga.bannerMobile && window.matchMedia('(max-width: 619px)').matches ? liga.bannerMobile : liga.bannerDesktop;
      image.alt=`Banner ${liga.nome}`;image.width=1080;image.height=608;
      image.loading=order===0?'eager':'lazy';image.decoding='async';
      banner.append(image);section.append(banner);
    }
    if(data.clubes && data.clubes.length){
      section.append(makeCarousel(data));
      data.clubes.forEach(club=>allClubs.push({club,liga}));
    }
    $('#conteudo').append(section);
  }

  function renderProntaEntrega(){
    const item=cfg.prontaEntrega;
    if(!item?.imagem)return;
    const section=el('section','pronta-section');
    section.id=item.id||'pronta-entrega';
    section.setAttribute('aria-label','Pronta entrega');
    const href=asUrl(item.link);
    const wrapper=el(href?'a':'div','pronta-banner');
    if(href){
      wrapper.href=href;wrapper.target='_blank';wrapper.rel='noopener noreferrer';
      wrapper.setAttribute('aria-label','Ver coleção pronta entrega');
    }
    const image=el('img');image.src=item.imagem;
    image.alt='Pronta entrega — banner';image.width=1920;image.height=800;
    image.loading='eager';image.decoding='async';
    wrapper.append(image);section.append(wrapper);
    // Inserir imediatamente após os três banners, ANTES das coleções.
    $('#hero-slider').insertAdjacentElement('afterend',section);
  }
  function renderSections(){
    if(colecoesIniciais)renderGroup(colecoesIniciais,-1,true);
    cfg.ligas.forEach((liga,i)=>renderGroup(liga,i));
    ligasExtras.forEach((liga,i)=>renderGroup(liga,cfg.ligas.length+i));
    secoesAdicionais.forEach((secao,i)=>renderGroup(secao,cfg.ligas.length+ligasExtras.length+i));
    colecoesFinais.forEach((liga,i)=>renderGroup(liga,cfg.ligas.length+ligasExtras.length+i));
  }
  function renderNavigation(){
    const nav=$('#navigation-content');
    const home=el('a','nav-top-link','INÍCIO');home.href='#inicio';nav.append(home);
    if(cfg.prontaEntrega?.imagem){const quick=el('a','nav-top-link','PRONTA ENTREGA');quick.href='#'+(cfg.prontaEntrega.id||'pronta-entrega');nav.append(quick);}
    if(colecoesIniciais){
      const collectionLink=el('a','nav-top-link',colecoesIniciais.nome);
      collectionLink.href='#'+colecoesIniciais.id;nav.append(collectionLink);
    }
    nav.append(el('span','nav-heading','COMPRE POR LIGA'));
    function navGroup(liga){
      const details=el('details','nav-league');
      const summary=el('summary','',liga.nome.toLocaleUpperCase('pt-BR'));
      const items=el('div','nav-items');
      const jump=el('a','','VER SEÇÃO');jump.href='#'+liga.id;items.append(jump);
      (liga.clubes || []).forEach(club=>{
        const href=asUrl(club.link);
        const node=el(href?'a':'span',href?'':'no-link',club.nome.toLocaleUpperCase('pt-BR'));
        if(href){node.href=href;node.target='_blank';node.rel='noopener noreferrer'}
        else node.title='Catálogo indisponível';
        items.append(node);
      });
      details.append(summary,items);nav.append(details);
    }
    cfg.ligas.forEach(navGroup);
    ligasExtras.forEach(navGroup);
    if(secoesAdicionais.length){
      nav.append(el('span','nav-heading','MAIS COLEÇÕES'));
      secoesAdicionais.forEach(navGroup);
    }
    if(colecoesFinais.length){
      nav.append(el('span','nav-heading','CHUTEIRAS'));
      colecoesFinais.forEach(navGroup);
    }
    if(whatsappHref){
      const contato=el('a','nav-contact-link','WHATSAPP');
      contato.href=whatsappHref;contato.target='_blank';contato.rel='noopener noreferrer';
      contato.setAttribute('aria-label','Entrar em contato pelo WhatsApp (abre em nova aba)');
      nav.append(contato);
    }
    if(instagramHref){
      const perfil=el('a','nav-contact-link','INSTAGRAM');
      perfil.href=instagramHref;perfil.target='_blank';perfil.rel='noopener noreferrer';
      perfil.setAttribute('aria-label','Instagram da loja (abre em nova aba)');
      nav.append(perfil);
    }
  }
  let openOverlay=null,lastFocused=null;
  const overlays={nav:$('#nav-overlay'),search:$('#search-overlay')};
  const triggers={nav:$('#menu-button'),search:$('#search-button')};
  const panels={nav:$('#navigation-panel'),search:$('#search-panel')};
  function openPanel(type){
    if(openOverlay)closePanel(false);
    lastFocused=document.activeElement;
    overlays[type].hidden=false;document.body.classList.add('overlay-open');
    triggers[type].setAttribute('aria-expanded','true');openOverlay=type;
    requestAnimationFrame(()=>{if(type==='search')$('#search-input').focus();else $('#close-menu').focus()});
  }
  function closePanel(restoreFocus=true){
    if(!openOverlay)return;
    const type=openOverlay;overlays[type].hidden=true;document.body.classList.remove('overlay-open');
    triggers[type].setAttribute('aria-expanded','false');openOverlay=null;
    if(restoreFocus && lastFocused instanceof HTMLElement)lastFocused.focus();
  }
  $('#menu-button').addEventListener('click',()=>openPanel('nav'));
  $('#search-button').addEventListener('click',()=>openPanel('search'));
  $('#close-menu').addEventListener('click',()=>closePanel());
  $('#close-search').addEventListener('click',()=>closePanel());
  document.querySelectorAll('[data-close]').forEach(node=>node.addEventListener('click',()=>closePanel()));
  $('#navigation-content').addEventListener('click',event=>{
    const anchor=event.target.closest('a[href^="#"]');if(anchor)closePanel(false);
  });
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
      e.preventDefault();openPanel('search');return;
    }
    if(!openOverlay)return;
    if(e.key==='Escape'){e.preventDefault();closePanel();return;}
    if(e.key==='Tab'){
      const panel=panels[openOverlay];
      const focusables=[...panel.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')].filter(node=>node.getClientRects().length);
      if(!focusables.length){e.preventDefault();panel.focus();return;}
      const first=focusables[0],last=focusables[focusables.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  function searchResult(label,detail,onClick,disabled=false){
    const node=el('button','search-row'+(disabled?' is-unavailable':''));node.type='button';node.disabled=disabled;
    node.append(el('span','',label.toLocaleUpperCase('pt-BR')),el('small','',detail.toLocaleUpperCase('pt-BR')));
    if(!disabled)node.addEventListener('click',onClick);
    return node;
  }
  function renderSearch(query){
    const results=$('#search-results');results.replaceChildren();
    const word=normalize(query);
    if(!word){results.append(el('p','search-message','Digite o nome de uma liga, clube ou coleção.'));return;}
    const frag=document.createDocumentFragment();let count=0;
    todasAsSecoes.forEach(liga=>{
      if(normalize(liga.nome).includes(word)){
        frag.append(searchResult(liga.nome,'LIGA',()=>{
          closePanel(false);document.getElementById(liga.id)?.scrollIntoView({behavior:reducesMotion.matches?'instant':'smooth'});
        }));count++;
      }
    });
    allClubs.forEach(({club,liga})=>{
      if(count>=70)return;
      if(normalize(club.nome).includes(word)){
        const href=asUrl(club.link);
        frag.append(searchResult(club.nome,href?liga.nome:'SEM CATÁLOGO',()=>{
          if(href){window.open(href,'_blank','noopener,noreferrer')}
        },!href));count++;
      }
    });
    if(!count)results.append(el('p','search-message','Nenhum resultado encontrado.'));
    else results.append(frag);
  }
  $('#search-input').addEventListener('input',e=>renderSearch(e.target.value));

  // Slider inicial: 3 banners, setas, indicadores, toque e reprodução automática.
  function renderHeroSlider(){
    const slidesHolder=$('#hero-slides');
    const dotsHolder=$('#hero-dots');
    const slider=$('#hero-slider');
    const sources=(cfg.loja?.bannersRotativos||[]).filter(item=>item?.imagem);
    if(!sources.length)return;
    const images=sources.map((item,index)=>{
      const frame=el('div','hero-slide');
      const img=el('img');
      img.src=item.imagem;img.alt=item.alt||`Banner ${index+1} da ${cfg.loja.nome}`;
      img.width=1080;img.height=1440;img.decoding='async';
      img.loading=index===0?'eager':'lazy';
      if(index===0) img.setAttribute('fetchpriority','high');
      frame.append(img);return frame;
    });
    slidesHolder.replaceChildren(...images);
    let active=0;
    let lastInteraction=0;
    const dots=sources.map((_,index)=>{
      const dot=el('button','hero-dot');dot.type='button';
      dot.setAttribute('aria-label',`Mostrar banner ${index+1}`);
      dot.addEventListener('click',()=>show(index,true));
      dotsHolder.append(dot);return dot;
    });
    const show=(index,manual=false)=>{
      active=(index+images.length)%images.length;
      images.forEach((node,i)=>{
        node.classList.toggle('is-active',i===active);
        node.setAttribute('aria-hidden',String(i!==active));
      });
      dots.forEach((node,i)=>{
        node.classList.toggle('is-active',i===active);
        node.setAttribute('aria-current',String(i===active));
      });
      if(manual)lastInteraction=Date.now();
    };
    $('#hero-prev').addEventListener('click',()=>show(active-1,true));
    $('#hero-next').addEventListener('click',()=>show(active+1,true));
    let xStart=null;
    slider.addEventListener('touchstart',e=>{xStart=e.touches[0]?.clientX??null},{passive:true});
    slider.addEventListener('touchend',e=>{
      if(xStart===null)return;
      const delta=(e.changedTouches[0]?.clientX??xStart)-xStart;
      if(Math.abs(delta)>45)show(active+(delta<0?1:-1),true);
      xStart=null;
    },{passive:true});
    if(images.length<2){$('#hero-prev').hidden=true;$('#hero-next').hidden=true;dotsHolder.hidden=true;}
    show(0);
    window.setInterval(()=>{
      if(images.length<2||document.hidden||reducesMotion.matches)return;
      if(Date.now()-lastInteraction<6500||slider.matches(':hover')||slider.contains(document.activeElement))return;
      show(active+1);
    },4800);
  }

  renderHeroSlider();
  renderProntaEntrega();
  renderFloatingWhatsapp();renderSections();renderNavigation();renderSearch('');
  const brandLogo=$('#brand-logo-image');
  const headerWhatsapp=$('#header-whatsapp');
  const headerInstagram=$('#header-instagram');
  const placeholder=$('#brand-placeholder');
  if (cfg.loja.logoCabecalho) {
    brandLogo.src=cfg.loja.logoCabecalho;brandLogo.hidden=false;
    if(placeholder)placeholder.hidden=true;
    const favicon=$('#dynamic-favicon');
    if(favicon)favicon.href=cfg.loja.logoCabecalho;
  } else {
    brandLogo.hidden=true;
    if(placeholder){placeholder.hidden=false;placeholder.textContent=cfg.loja.nome;}
  }
  brandLogo.alt=`Logo de ${cfg.loja.nome}`;
  if(whatsappHref){headerWhatsapp.href=whatsappHref;headerWhatsapp.hidden=false;}
  else headerWhatsapp?.remove();
  if(instagramHref && headerInstagram){headerInstagram.href=instagramHref;headerInstagram.hidden=false;}
  else headerInstagram?.remove();
  const footerInstagram=$('#footer-instagram');
  if(instagramHref && footerInstagram){
    footerInstagram.href=instagramHref;
    footerInstagram.hidden=false;
    footerInstagram.textContent='Instagram';
    footerInstagram.setAttribute('aria-label','Instagram de '+cfg.loja.nome);
  } else footerInstagram?.remove();
  $('#brand-link').setAttribute('aria-label',`${cfg.loja.nome} — voltar ao início`);
  $('#footer-name').textContent=cfg.loja.nome;
  $('#footer-year').textContent=String(new Date().getFullYear());
  document.title=`${cfg.loja.nome} | Catálogo Esportivo`;

  // Animação contínua: um único requestAnimationFrame, com pausa em interação,
  // fora da tela, em abas ocultas e quando há preferência de movimento reduzido.
  let lastTime=0;
  function animate(now){
    const delta=lastTime?Math.min(80,now-lastTime):0;lastTime=now;
    if(!document.hidden&&!reducesMotion.matches){
      for(const state of carouselStates){
        const {viewport,segment}=state;
        if(segment<1)continue;
        if(viewport.scrollLeft < segment*.5)viewport.scrollLeft+=segment;
        else if(viewport.scrollLeft>segment*1.5)viewport.scrollLeft-=segment;
        if(!state.visible||state.hovered||state.focused||state.dragging||now<state.pauseUntil)continue;
        viewport.scrollLeft += delta * .024;
      }
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
