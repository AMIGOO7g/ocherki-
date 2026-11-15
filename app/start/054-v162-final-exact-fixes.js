/*@block [" id=\"v162-final-exact-fixes\"", ""]*/
(function(){
  function purgeLegacyLightTitle(){
    document.querySelectorAll('.power-title').forEach(function(el){ el.remove(); });
    var btn=document.getElementById('powerBtn');
    /* power button keeps its accessible label; visual tooltip is disabled above */
  }
  purgeLegacyLightTitle();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',purgeLegacyLightTitle,{once:true});
})();
