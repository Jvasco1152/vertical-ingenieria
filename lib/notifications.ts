import { prisma } from './prisma';

/**
 * Helper para crear notificaciones automáticamente
 */

interface CreateNotificationParams {
  userId: string;
  projectId: string;
  title: string;
  message: string;
  type: 'NEW_COMMENT' | 'NEW_IMAGE' | 'PHASE_CHANGE' | 'PROJECT_COMPLETED' | 'PROJECT_ASSIGNED';
}

/**
 * Crea una notificación para un usuario
 */
export async function createNotification({
  userId,
  projectId,
  title,
  message,
  type,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        projectId,
        title,
        message,
        read: false,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creando notificación:', error);
    return null;
  }
}

/**
 * Notifica al cliente cuando se sube una nueva imagen
 */
export async function notifyNewImage(projectId: string, uploaderName: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { clientId: true, title: true },
    });

    if (!project) return;

    await createNotification({
      userId: project.clientId,
      projectId,
      title: 'Nueva imagen subida',
      message: `${uploaderName} subió una nueva imagen al proyecto "${project.title}"`,
      type: 'NEW_IMAGE',
    });
  } catch (error) {
    console.error('Error notificando nueva imagen:', error);
  }
}

/**
 * Notifica a todos los involucrados cuando hay un nuevo comentario
 */
export async function notifyNewComment(
  projectId: string,
  commenterName: string,
  commenterId: string
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workers: {
          select: { workerId: true },
        },
      },
    });

    if (!project) return;

    // Recopilar IDs de usuarios a notificar (cliente + trabajadores, excepto el comentarista)
    const userIds = new Set<string>();

    // Agregar cliente
    if (project.clientId !== commenterId) {
      userIds.add(project.clientId);
    }

    // Agregar trabajadores
    project.workers.forEach((w) => {
      if (w.workerId !== commenterId) {
        userIds.add(w.workerId);
      }
    });

    // Crear notificaciones para cada usuario
    const promises = Array.from(userIds).map((userId) =>
      createNotification({
        userId,
        projectId,
        title: 'Nuevo comentario',
        message: `${commenterName} comentó en el proyecto "${project.title}"`,
        type: 'NEW_COMMENT',
      })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error('Error notificando nuevo comentario:', error);
  }
}

/**
 * Notifica cuando cambia la fase del proyecto
 */
export async function notifyPhaseChange(
  projectId: string,
  oldPhase: string,
  newPhase: string
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workers: {
          select: { workerId: true },
        },
      },
    });

    if (!project) return;

    const phaseLabels: Record<string, string> = {
      MEASUREMENT: 'Medición',
      DESIGN: 'Diseño',
      APPROVAL: 'Aprobación',
      INSTALLATION: 'Instalación',
      FINISHING: 'Acabados',
      DELIVERY: 'Entrega',
    };

    // Notificar a cliente + trabajadores
    const userIds = [project.clientId, ...project.workers.map((w) => w.workerId)];

    const promises = userIds.map((userId) =>
      createNotification({
        userId,
        projectId,
        title: 'Cambio de fase',
        message: `El proyecto "${project.title}" avanzó de ${phaseLabels[oldPhase]} a ${phaseLabels[newPhase]}`,
        type: 'PHASE_CHANGE',
      })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error('Error notificando cambio de fase:', error);
  }
}

/**
 * Notifica cuando el proyecto se completa
 */
export async function notifyProjectCompleted(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workers: {
          select: { workerId: true },
        },
      },
    });

    if (!project) return;

    // Notificar a cliente + trabajadores
    const userIds = [project.clientId, ...project.workers.map((w) => w.workerId)];

    const promises = userIds.map((userId) =>
      createNotification({
        userId,
        projectId,
        title: '¡Proyecto completado!',
        message: `El proyecto "${project.title}" ha sido completado exitosamente`,
        type: 'PROJECT_COMPLETED',
      })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error('Error notificando proyecto completado:', error);
  }
}

/**
 * Notifica a un trabajador cuando es asignado a un proyecto
 */
export async function notifyWorkerAssigned(projectId: string, workerId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true },
    });

    if (!project) return;

    await createNotification({
      userId: workerId,
      projectId,
      title: 'Asignado a nuevo proyecto',
      message: `Has sido asignado al proyecto "${project.title}"`,
      type: 'PROJECT_ASSIGNED',
    });
  } catch (error) {
    console.error('Error notificando asignación de trabajador:', error);
  }
}
