import { Routes } from '@angular/router';
import { MemberDirectory } from './pages/member-directory/member-directory';
import { MemberEditor } from './pages/member-editor/member-editor';
import { MemberOverview } from './pages/member-overview/member-overview';
import { MembershipFreeze } from './pages/membership-freeze/membership-freeze';
import { PlanSwitch } from './pages/plan-switch/plan-switch';

export const MEMBER_FEATURE_ROUTES: Routes = [
  { path: '', component: MemberDirectory, data: { title: 'Member Directory' } },
  { path: 'details', component: MemberEditor, data: { title: 'Member Details' } },
  { path: 'profile', component: MemberOverview, data: { title: 'Member Profile' } },
  { path: 'change-plan', component: PlanSwitch, data: { title: 'Change Membership Plan' } },
  { path: 'freeze', component: MembershipFreeze, data: { title: 'Freeze Membership' } }
];
