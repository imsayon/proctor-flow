import test from "node:test";
import assert from "node:assert/strict";
import { runGreedyAllocation, allocateEnrolledStudents, getActiveCoords } from "../src/utils/algorithm.js";
const faculty = ["f1","f2","f3","f4"].map((id)=>({id,name:id,available:true,duties:0}));
const s1={id:"s1",eventId:"e",date:"2026-12-10",slot:"FN",startTime:"09:00",endTime:"11:00",roomId:"r1",maxStudents:20};
const s2={id:"s2",eventId:"e",date:"2026-12-10",slot:"FN",startTime:"10:00",endTime:"12:00",roomId:"r2",maxStudents:20};
test("never double books faculty in overlapping sessions",()=>{
 const a=runGreedyAllocation([s1,s2],faculty,[],{maxDutiesPerFaculty:2}).allocations;
 assert.equal(a[0].status,"assigned");assert.equal(a[1].status,"assigned");
 assert.equal(new Set([a[0].f1Id,a[0].f2Id,a[1].f1Id,a[1].f2Id]).size,4);
});
test("unassigned is atomic when fewer than two staff are available",()=>{
 const result=runGreedyAllocation([s1],[faculty[0]],[],{}).allocations[0];
 assert.equal(result.status,"unassigned");assert.equal(result.f1Id,null);assert.equal(result.f2Id,null);
});
test("leave restrictions are honored",()=>{
 const leave=[{facultyId:"f1",from:"2026-12-10",to:"2026-12-10",status:"approved"}];
 const result=runGreedyAllocation([s1],faculty,leave,{leaveBufferDays:0}).allocations[0];
 assert.notEqual(result.f1Id,"f1");assert.notEqual(result.f2Id,"f1");
});
test("room overlaps cannot be double-booked",()=>{
 const result=runGreedyAllocation([s1,{...s2,roomId:"r1"}],faculty,[],{}).allocations;
 assert.equal(result[0].status,"assigned");assert.equal(result[1].status,"unassigned");
});
test("capacity is a hard constraint when room inventory supplied",()=>{
 const result=runGreedyAllocation([s1],faculty,[],{rooms:[{id:"r1",capacity:10}]}).allocations[0];
 assert.equal(result.status,"unassigned");
});
test("max duties enforced for every assignment",()=>{
 const result=runGreedyAllocation([s1,s2],faculty,[],{maxDutiesPerFaculty:1}).allocations;
 const ids=result.flatMap(a=>[a.f1Id,a.f2Id]).filter(Boolean);
 assert.equal(ids.length,new Set(ids).size);
});
test("real student seating respects blocked cells and is unique",()=>{
 const grid=[[{state:"ACTIVE"},{state:"VOID"},{state:"ACTIVE"}],[{state:"ACTIVE"},{state:"ACTIVE"},{state:"VOID"}]];
 const students=[{uid:"a",branch:"ISE"},{uid:"b",branch:"CSE"},{uid:"c",branch:"ISE"}];
 const seats=allocateEnrolledStudents(students,grid,42);
 assert.equal(seats.length,3);
 assert.equal(new Set(seats.map(s=>s.uid)).size,3);
 assert.equal(new Set(seats.map(s=>s.row+":"+s.col)).size,3);
 assert.equal(getActiveCoords(grid).length,4);
 assert.ok(seats.every(s=>!(s.row===1&&s.col===2)));
 assert.deepEqual(seats,allocateEnrolledStudents(students,grid,42));
});
test("overcapacity and missing student UIDs fail closed",()=>{
 const grid=[[{state:"ACTIVE"}]];
 assert.throws(()=>allocateEnrolledStudents([{uid:"a"},{uid:"b"}],grid));
 assert.throws(()=>allocateEnrolledStudents([{name:"no uid"}],grid));
});
