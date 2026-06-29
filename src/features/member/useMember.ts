import { useCallback, useState } from 'react';
import { checkMember, registerMember, type MemberInfo } from '../../lib/gasClient';

export function useMember() {
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const loadMember = useCallback(async (lineId: string) => {
    const member = await checkMember(lineId);
    setIsRegistered(member.isMember);
    setMemberInfo(member.isMember && member.data ? member.data : null);
    return member;
  }, []);

  const saveMember = useCallback(async (lineId: string | undefined, data: MemberInfo) => {
    await registerMember({ lineId, ...data });
    setIsRegistered(true);
    setMemberInfo(data);
  }, []);

  return { memberInfo, setMemberInfo, isRegistered, setIsRegistered, loadMember, saveMember };
}
