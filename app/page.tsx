"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Registration={participantName:string;participantType:"kid"|"adult";age:string;guardianName:string;phone:string};
const initialForm:Registration={participantName:"",participantType:"kid",age:"",guardianName:"",phone:""};

export default function Home(){
 const[form,setForm]=useState(initialForm);const[submitting,setSubmitting]=useState(false);const[error,setError]=useState("");const[registrationId,setRegistrationId]=useState("");
 useEffect(()=>{const c=(document as Document&{modelContext?:{registerTool?:Function}}).modelContext;if(!c?.registerTool)return;const a=new AbortController();void Promise.resolve(c.registerTool({name:"start_garba_registration",title:"Start Garba registration",description:"Open the registration form for the Joy Kids Care Garba Workshop.",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>{document.getElementById("registration")?.scrollIntoView({behavior:"smooth"});return{status:"ready",feePerPerson:199}}},{signal:a.signal})).catch(()=>undefined);return()=>a.abort()},[]);
 function update(k:keyof Registration,v:string){setForm(x=>({...x,[k]:v}))}
 async function submitRegistration(e:React.FormEvent){e.preventDefault();setError("");setRegistrationId("");if(!/^\d{10}$/.test(form.phone)){setError("Please enter a valid 10-digit mobile number.");return}setSubmitting(true);try{const r=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const j=await r.json();if(!r.ok||!j.registrationId)throw new Error(j.error||"Registration could not be submitted.");setRegistrationId(j.registrationId);setForm(initialForm)}catch(x){setError(x instanceof Error?x.message:"Registration could not be submitted.")}finally{setSubmitting(false)}}
 return <main>
  <header className="topbar"><a className="brand" href="#top" aria-label="Joy Kids Care home"><span className="brand-mark"><Sparkles size={20}/></span><span>JOY KIDS CARE</span></a><a className="phone" href="tel:+917861944194"><Phone size={17}/> 78619 44194</a></header>
  <section id="top" className="hero"><div className="hero-copy"><span className="eyebrow">Learn · Dance · Celebrate</span><h1>Garba<br/><em>Workshop</em></h1><div className="event-grid" aria-label="Event details"><div><CalendarDays/><span><small>DATES</small>28th, 29th &amp; 30th<br/>September 2026</span></div><div><Clock3/><span><small>TIME</small>6–7 PM</span></div><div><MapPin/><span><small>LOCATION</small>Joy Kids Care Parivar</span></div></div><a className="primary-cta" href="#registration">Register now <span>₹199</span></a></div><div className="poster-wrap"><img src="/garba-workshop-banner.jpeg" alt="Joy Kids Care Parivar Garba Workshop poster"/></div></section>
  <section id="registration" className="registration-section"><div className="section-heading"><span>Limited registrations</span><h2>Reserve your place</h2></div><div className="form-card">{registrationId?<div className="success-card" role="status"><CheckCircle2/><h3>Registration received</h3><p>Your registration ID is <strong>{registrationId}</strong>.</p><p>We have saved your details. The organizer will contact you if anything else is needed.</p><Button type="button" className="submit-button" onClick={()=>setRegistrationId("")}>Register another participant</Button></div>:<form onSubmit={submitRegistration}><div className="form-grid">
   <div className="field full"><Label htmlFor="participantName">Participant full name</Label><Input id="participantName" required value={form.participantName} onChange={e=>update("participantName",e.target.value)} placeholder="Enter full name"/></div>
   <fieldset className="field full"><legend>Registering as</legend><RadioGroup value={form.participantType} onValueChange={v=>update("participantType",v)} className="choice-row"><Label className="choice"><RadioGroupItem value="kid"/> Kid</Label><Label className="choice"><RadioGroupItem value="adult"/> Adult</Label></RadioGroup></fieldset>
   <div className="field"><Label htmlFor="age">Age {form.participantType==="adult"&&"(optional)"}</Label><Input id="age" type="number" min="3" max="90" required={form.participantType==="kid"} value={form.age} onChange={e=>update("age",e.target.value)} placeholder="Age"/></div>
   <div className="field"><Label htmlFor="guardianName">Parent / Guardian {form.participantType==="adult"&&"(optional)"}</Label><Input id="guardianName" required={form.participantType==="kid"} value={form.guardianName} onChange={e=>update("guardianName",e.target.value)} placeholder="Guardian name"/></div>
   <div className="field"><Label htmlFor="phone">Mobile number</Label><Input id="phone" required inputMode="numeric" maxLength={10} value={form.phone} onChange={e=>update("phone",e.target.value.replace(/\D/g,""))} placeholder="10-digit number"/></div>
  </div>{error&&<p className="form-error" role="alert">{error}</p>}<Button type="submit" disabled={submitting} className="submit-button">{submitting?"Submitting registration…":"Submit registration"}</Button><p className="secure-note">No login or online payment is required.</p></form>}</div></section>
  <footer><div><strong>Joy Kids Care</strong><span>Garba Workshop · September 2026</span></div><a href="tel:+917861944194">Questions? Call 78619 44194</a></footer>
 </main>
}
