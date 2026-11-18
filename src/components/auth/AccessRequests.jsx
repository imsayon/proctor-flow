import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, writeBatch, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { useToast } from "../common/Toast";

export default function AccessRequests() {
  const { isAdmin, institutionId } = useAuth();
  const [requests,setRequests] = useState([]);
  const [busy,setBusy] = useState("");
  const [error,setError] = useState("");
  const toast = useToast();

  useEffect(()=>{
    if (!isAdmin || !institutionId) return;
    const ref=collection(db,"institutions",institutionId,"join_requests");
    return onSnapshot(ref,snap=>setRequests(snap.docs.map(d=>({id:d.id,...d.data()}))),e=>setError(e.message));
  },[isAdmin,institutionId]);

  const decide = async (request, approve) => {
    if (!isAdmin || !institutionId) return;
    if (!["faculty","student"].includes(request.requestedRole)) {
      setError("Unsupported role in access request."); return;
    }
    setBusy(request.id);setError("");
    try {
      const batch=writeBatch(db);
      const requestRef=doc(db,"institutions",institutionId,"join_requests",request.id);
      if (approve) {
        const userRef=doc(db,"institutions",institutionId,"users",request.id);
        batch.set(userRef, {
          uid:request.id,email:request.email,name:request.name||request.email,
          role:request.requestedRole,status:"active",
          institutionId,approvedAt:serverTimestamp(),
        },{merge:true});
      }
      batch.update(requestRef,{status:approve?"approved":"rejected",reviewedAt:serverTimestamp()});
      await batch.commit();
      toast(approve?"Access approved":"Request rejected","success");
    } catch(e) {setError(e.message);toast("Access decision failed","error");}
    finally {setBusy("");}
  };

  if (!isAdmin) return <p>Administrator access is required.</p>;
  const pending=requests.filter(r=>r.status==="pending");
  return <section className="max-w-5xl pb-10">
    <div className="iv-eyebrow">INSTITUTION ADMINISTRATION</div><h1 className="iv-heading">Access requests</h1>
    <p className="iv-subhead mb-6">Approve verified Firebase accounts as faculty or students. Administrator accounts require trusted provisioning.</p>
    {error && <p role="alert" style={{color:"var(--ui-red)"}}>{error}</p>}
    {pending.length===0 && <div className="iv-panel"><p>No pending membership requests.</p></div>}
    <div className="space-y-3">{pending.map(r=><div key={r.id} className="iv-panel flex flex-wrap items-center justify-between gap-4">
      <div><div className="font-bold">{r.name||r.email}</div><p className="iv-subhead">{r.email} · Requested: {r.requestedRole}</p></div>
      <div className="flex gap-2"><button className="iv-action primary" disabled={!!busy} onClick={()=>decide(r,true)}>Approve</button><button className="iv-action" disabled={!!busy} onClick={()=>decide(r,false)}>Reject</button></div>
    </div>)}</div>
  </section>;
}
